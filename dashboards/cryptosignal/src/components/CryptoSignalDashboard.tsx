"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/src/store/authStore";
import clsx from "clsx";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface Signal {
  id: string;
  symbol: string;
  direction: string;
  confidence: number;
  rr: number;
  createdAt: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  expiresAt: string;
}

export default function CryptoSignalDashboard() {
  const token = useAuthStore((s) => s.token);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    async function load() {
      setLoading(true);
      try {
        const [sigRes, subRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/signals/sample`, { headers }),
          axios.get(`${BACKEND_URL}/api/subscription`, { headers })
        ]);
        setSignals(sigRes.data);
        setSubscription(subRes.data);
      } catch (err) {
        console.error("Error cargando CryptoSignal dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  async function changePlan(plan: "free" | "weekly" | "monthly" | "annual") {
    if (!token) return;
    setPlanLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/subscription`,
        { plan },
        { headers }
      );
      setSubscription(res.data);
    } catch (err) {
      console.error("Error cambiando plan:", err);
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">
          CryptoSignal · <span className="text-brand-500">Señales IA</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-xl">
          Este panel muestra señales recientes generadas por tu motor de IA y te permite gestionar tu plan de suscripción.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <PlanCard
          title="Free"
          description="Prueba básica · 1 semana de acceso limitado."
          active={subscription?.plan === "free"}
          onSelect={() => changePlan("free")}
          loading={planLoading}
        />
        <PlanCard
          title="Weekly"
          description="Ideal para probar el sistema en serio."
          active={subscription?.plan === "weekly"}
          onSelect={() => changePlan("weekly")}
          loading={planLoading}
        />
        <PlanCard
          title="Monthly"
          description="Uso regular, señales constantes."
          active={subscription?.plan === "monthly"}
          onSelect={() => changePlan("monthly")}
          loading={planLoading}
        />
        <PlanCard
          title="Annual"
          description="Compromiso largo plazo, mejor relación €/día."
          active={subscription?.plan === "annual"}
          onSelect={() => changePlan("annual")}
          loading={planLoading}
        />
      </section>

      {subscription && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
          <p className="text-slate-300">
            Plan actual: <span className="font-semibold">{subscription.plan}</span>{" "}
            · Estado: <span className="font-semibold">{subscription.status}</span>{" "}
            · Expira:{" "}
            <span className="text-slate-200">
              {new Date(subscription.expiresAt).toLocaleString()}
            </span>
          </p>
        </section>
      )}

      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 overflow-x-auto">
        <h2 className="text-sm font-semibold mb-2">Señales recientes</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Cargando señales...</p>
        ) : signals.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aún no hay señales disponibles. Cuando el motor esté operando, verás aquí las recomendaciones.
          </p>
        ) : (
          <SignalsTable signals={signals} />
        )}
      </section>
    </main>
  );
}

interface PlanCardProps {
  title: string;
  description: string;
  active: boolean;
  loading: boolean;
  onSelect: () => void;
}

function PlanCard({ title, description, active, loading, onSelect }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={loading}
      className={clsx(
        "text-left bg-slate-900/60 border rounded-xl p-3 flex flex-col gap-1 text-xs transition",
        active
          ? "border-brand-500 shadow-[0_0_0_1px_rgba(34,197,94,0.5)]"
          : "border-slate-800 hover:border-brand-500/60"
      )}
    >
      <span className="font-semibold text-sm">{title}</span>
      <p className="text-slate-400">{description}</p>
      {active && (
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand-400">
          ● Plan activo
        </span>
      )}
    </button>
  );
}

function SignalsTable({ signals }: { signals: Signal[] }) {
  return (
    <table className="min-w-full text-xs">
      <thead className="text-slate-400 border-b border-slate-800">
        <tr>
          <th className="text-left py-1 pr-2">Símbolo</th>
          <th className="text-center py-1 px-2">Dirección</th>
          <th className="text-right py-1 px-2">Confianza</th>
          <th className="text-right py-1 px-2">RR</th>
          <th className="text-right py-1 pl-2">Fecha</th>
        </tr>
      </thead>
      <tbody>
        {signals.map((s) => (
          <tr key={s.id} className="border-b border-slate-900/50">
            <td className="py-1 pr-2">{s.symbol}</td>
            <td className="py-1 px-2 text-center text-[11px] uppercase">
              {s.direction}
            </td>
            <td className="py-1 px-2 text-right">
              {(s.confidence * 100).toFixed(1)}%
            </td>
            <td className="py-1 px-2 text-right">{s.rr.toFixed(2)}</td>
            <td className="py-1 pl-2 text-right text-slate-400">
              {new Date(s.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

