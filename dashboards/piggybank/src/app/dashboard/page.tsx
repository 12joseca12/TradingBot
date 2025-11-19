"use client";

import PiggyBankDashboard from "@/src/components/PiggyBankDashboard";
import { useAuthStore } from "@/src/store/authStore";

export default function DashboardPage() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return (
      <main className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard PiggyBank</h1>
        <p className="text-slate-400 text-sm">
          Debes iniciar sesión primero en la página principal para acceder a tu dashboard.
        </p>
      </main>
    );
  }

  return <PiggyBankDashboard />;
}

