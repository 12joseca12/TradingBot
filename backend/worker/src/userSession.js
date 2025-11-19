import WebSocket from "ws";
import prisma from "./prismaClient.js";
import { decryptFromB64 } from "./crypto.js";
import { computePositionSize } from "./riskConfig.js";

const ML_URL = process.env.ML_URL || "http://ml:8000";

const MIN_CONFIDENCE = Number(process.env.WORKER_MIN_CONFIDENCE || "0.56");
const MIN_EV = Number(process.env.WORKER_MIN_EV || "0.0");

function toKrakenPair(symbol) {
  const [base, quote] = symbol.split("/");
  if (base === "BTC") return `XBT/${quote}`;
  return `${base}/${quote}`;
}

function fromKrakenPair(pair) {
  const [base, quote] = pair.split("/");
  if (base === "XBT") return `BTC/${quote}`;
  return `${base}/${quote}`;
}

function updateATR(state, symbol) {
  const s = state[symbol];
  if (!s || s.series.length < 14) return;

  let sum = 0;
  const start = s.series.length - 14;
  for (let i = start; i < s.series.length; i++) {
    const bar = s.series[i];
    sum += Math.abs(bar.h - bar.l);
  }
  s.atr = sum / 14;
}

function canRun(lastRun, symbol, intervalMs) {
  const now = Date.now();
  if (!lastRun[symbol] || now - lastRun[symbol] > intervalMs) {
    lastRun[symbol] = now;
    return true;
  }
  return false;
}

async function callModel(atrPct, ret1) {
  const payload = {
    features: { atrPct, ret1 }
  };

  const resp = await fetch(`${ML_URL}/predict`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    throw new Error(`ML service error: ${resp.status}`);
  }

  const json = await resp.json();
  return json.p ?? 0.5;
}

async function maybeOpenPaperTrade(user, settings, symbol, state) {
  const s = state[symbol];
  if (!s || !s.last || !s.atr) return;

  const atrPct = s.atr / s.last;
  const len = s.series.length;
  const prevClose = len > 1 ? s.series[len - 2].c : s.last;
  const ret1 = prevClose ? (s.last - prevClose) / prevClose : 0;

  const p = await callModel(atrPct, ret1);

  const rr = settings.rrTP ?? 1.4;
  const EV = p * rr - (1 - p) * 1;

  if (p < MIN_CONFIDENCE || EV < MIN_EV || atrPct < 0.0008) {
    return;
  }

  const openPositionsCount = await prisma.position.count({
    where: {
      userId: user.id,
      status: "open"
    }
  });

  if (openPositionsCount >= (settings.maxSimultaneous ?? 3)) {
    return;
  }

  const { size, notional, riskPct } = computePositionSize(settings, s, p);
  if (size <= 0) return;

  const position = await prisma.position.create({
    data: {
      userId: user.id,
      symbol,
      size,
      entryPrice: s.last,
      stopLoss: null,
      takeProfit: null,
      mode: settings.riskMode || "moderado",
      status: "open"
    }
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      symbol,
      type: "buy",
      price: s.last,
      amount: size,
      status: "filled"
    }
  });

  console.log(
    `[PAPER] user=${user.email} symbol=${symbol} p=${(p * 100).toFixed(
      1
    )}% EV=${EV.toFixed(3)} size=${size.toFixed(6)} notional=${notional.toFixed(
      2
    )} riskPct=${(riskPct * 100).toFixed(2)}%`
  );
}

export function startUserSession(user, settings, credsDecrypted) {
  const rawSymbols = (settings.symbols || "BTC/USDT,ETH/USDT").split(",");
  const symbols = rawSymbols.map((s) => s.trim()).filter(Boolean);

  const ws = new WebSocket("wss://ws.kraken.com/");
  const books = {};
  const lastRun = {};

  ws.on("open", () => {
    const pairs = symbols.map(toKrakenPair);
    ws.send(
      JSON.stringify({
        event: "subscribe",
        pair: pairs,
        subscription: { name: "ticker" }
      })
    );
    console.log(
      `WS conectado para user=${user.email}, symbols=${symbols.join(", ")}`
    );
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (!Array.isArray(msg) || msg.length < 3) return;

      const [, tick, pair] = msg;

      const symbol = fromKrakenPair(pair);
      const lastStr =
        tick.c?.[0] || tick.a?.[0] || tick.b?.[0] || tick.p?.[0] || null;
      if (!lastStr) return;

      const last = parseFloat(lastStr);
      if (!Number.isFinite(last)) return;

      let s = books[symbol];
      if (!s) {
        s = books[symbol] = {
          last: null,
          series: [],
          atr: null
        };
      }
      s.last = last;

      const nowSec = Math.floor(Date.now() / 1000);
      let bar = s.series[s.series.length - 1];

      if (!bar || nowSec - bar.ts >= 60) {
        bar = { ts: nowSec, o: last, h: last, l: last, c: last };
        s.series.push(bar);
        if (s.series.length > 500) s.series.shift();
      } else {
        bar.h = Math.max(bar.h, last);
        bar.l = Math.min(bar.l, last);
        bar.c = last;
      }

      updateATR(books, symbol);

      if (!canRun(lastRun, symbol, 2000)) return;

      maybeOpenPaperTrade(user, settings, symbol, books).catch((err) => {
        console.error("maybeOpenPaperTrade error:", err?.message || err);
      });
    } catch (e) {
    }
  });

  ws.on("error", (err) => {
    console.error(`WS error user=${user.email}:`, err?.message || err);
  });

  ws.on("close", () => {
    console.log(
      `WS cerrado para user=${user.email}, reconectando en 5s...`
    );
    setTimeout(() => startUserSession(user, settings, credsDecrypted), 5000);
  });
}

