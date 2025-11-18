"use client";

import CryptoSignalDashboard from "@/components/CryptoSignalDashboard";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return (
      <main className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard CryptoSignal</h1>
        <p className="text-slate-400 text-sm">
          Inicia sesión o regístrate desde la página principal para ver las señales y tu plan de suscripción.
        </p>
      </main>
    );
  }

  return <CryptoSignalDashboard />;
}
