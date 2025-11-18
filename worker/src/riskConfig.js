// worker/src/riskConfig.js

// Equity virtual para PAPER (hasta que conectemos balance real Kraken)
const EQUITY_VIRTUAL = Number(process.env.WORKER_VIRTUAL_EQUITY || "1000");

export function computeRiskPct(settings, confidence) {
  const minRisk = settings.minRiskPct ?? 0.01;
  const maxRisk = settings.maxRiskPct ?? 0.05;

  // Normalizamos confianza [0.5,1] → [0,1]
  const x = Math.max(0, Math.min(1, (confidence - 0.5) / 0.5));
  return minRisk + x * (maxRisk - minRisk);
}

export function computePositionSize(settings, symbolState, confidence) {
  const riskPct = computeRiskPct(settings, confidence);
  const price = symbolState.last;
  if (!price || price <= 0) return { size: 0, notional: 0, riskPct: 0 };

  const notional = EQUITY_VIRTUAL * riskPct;
  const size = notional / price;

  return { size, notional, riskPct };
}
