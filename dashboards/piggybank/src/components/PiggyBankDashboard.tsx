"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/src/store/authStore";
import clsx from "clsx";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface Overview {
  email: string;
  openPositions: number;
  recentOrders24h: number;
  activeSubscriptions: any[];
}

interface Position {
  id: string;
  symbol: string;
  size: number;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  mode: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
}

interface Order {
  id: string;
  symbol: string;
  type: string;
  price: number | null;
  amount: number;
  status: string;
  createdAt: string;
}

export default function PiggyBankDashboard() {
  const token = useAuthStore((s) => s.token);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"positions" | "orders">("positions");

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const headers = { Authorization: `Bearer ${token}` };

    async function loadAll() {
      try {
        const [ovRes, posRes, ordRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/me/overview`, { headers }),
          axios.get(`${BACKEND_URL}/api/me/positions?status=open`, { headers }),
          axios.get(`${BACKEND_URL}/api/me/orders`, { headers })
        ]);

        setOverview(ovRes.data);
        setPositions(posRes.data);
        setOrders(ordRes.data);
      } catch (err) {
        console.error("Error cargando dashboard PiggyBank:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [token]);

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          PiggyBank · <span className="text-piggy-500">Dashboard privado</span>
        </h1>
        {overview && (
          <p className="text-xs text-slate-400">
            Sesión iniciada como <span className="text-slate-200">{overview.email}</span>
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardStat
          title="Posiciones abiertas"
          value={overview?.openPositions ?? 0}
        />
        <CardStat
          title="Órdenes últimas 24h"
          value={overview?.recentOrders24h ?? 0}
        />
        <CardStat
          title="Suscripciones activas"
          value={overview?.activeSubscriptions?.length ?? 0}
        />
      </section>

      <section className="space-y-3">
        <div className="inline-flex rounded-full bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setTab("positions")}
            className={clsx(
              "px-3 py-1 text-xs rounded-full",
              tab === "positions" ? "bg-piggy-600" : "text-slate-300"
            )}
          >
            Posiciones
          </button>
          <button
            onClick={() => setTab("orders")}
            className={clsx(
              "px-3 py-1 text-xs rounded-full",
              tab === "orders" ? "bg-piggy-600" : "text-slate-300"
            )}
          >
            Órdenes
          </button>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-400">Cargando datos...</p>
          ) : tab === "positions" ? (
            <PositionsTable positions={positions} />
          ) : (
            <OrdersTable orders={orders} />
          )}
        </div>
      </section>
    </main>
  );
}

function CardStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
      <span className="text-xs text-slate-400">{title}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}

function PositionsTable({ positions }: { positions: Position[] }) {
  if (!positions.length) {
    return <p className="text-sm text-slate-400">No hay posiciones abiertas.</p>;
  }

  return (
    <table className="min-w-full text-xs">
      <thead className="text-slate-400 border-b border-slate-800">
        <tr>
          <th className="text-left py-1 pr-2">Símbolo</th>
          <th className="text-right py-1 px-2">Tamaño</th>
          <th className="text-right py-1 px-2">Precio entrada</th>
          <th className="text-center py-1 px-2">Modo</th>
          <th className="text-center py-1 px-2">Estado</th>
          <th className="text-right py-1 pl-2">Abierta</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((p) => (
          <tr key={p.id} className="border-b border-slate-900/50">
            <td className="py-1 pr-2">{p.symbol}</td>
            <td className="py-1 px-2 text-right">
              {p.size.toFixed(6)}
            </td>
            <td className="py-1 px-2 text-right">
              {p.entryPrice.toFixed(2)}
            </td>
            <td className="py-1 px-2 text-center uppercase text-[10px]">
              {p.mode}
            </td>
            <td className="py-1 px-2 text-center text-[10px]">
              {p.status}
            </td>
            <td className="py-1 pl-2 text-right text-slate-400">
              {new Date(p.openedAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OrdersTable({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return <p className="text-sm text-slate-400">No hay órdenes recientes.</p>;
  }

  return (
    <table className="min-w-full text-xs">
      <thead className="text-slate-400 border-b border-slate-800">
        <tr>
          <th className="text-left py-1 pr-2">Símbolo</th>
          <th className="text-center py-1 px-2">Tipo</th>
          <th className="text-right py-1 px-2">Precio</th>
          <th className="text-right py-1 px-2">Cantidad</th>
          <th className="text-center py-1 px-2">Estado</th>
          <th className="text-right py-1 pl-2">Fecha</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-b border-slate-900/50">
            <td className="py-1 pr-2">{o.symbol}</td>
            <td className="py-1 px-2 text-center uppercase text-[10px]">
              {o.type}
            </td>
            <td className="py-1 px-2 text-right">
              {o.price !== null ? o.price.toFixed(2) : "-"}
            </td>
            <td className="py-1 px-2 text-right">
              {o.amount.toFixed(6)}
            </td>
            <td className="py-1 px-2 text-center text-[10px]">
              {o.status}
            </td>
            <td className="py-1 pl-2 text-right text-slate-400">
              {new Date(o.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

