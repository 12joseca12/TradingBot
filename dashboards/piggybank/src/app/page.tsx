"use client";

import { useState } from "react";
import AuthForm from "@/src/components/AuthForm";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Controla tu bot · <span className="text-piggy-500">PiggyBank</span>
        </h1>
        <p className="text-slate-400 max-w-xl">
          Este panel está conectado a tu backend y a tus exchanges. Aquí verás tus posiciones,
          tus órdenes y podrás activar/desactivar el bot en tiempo real.
        </p>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <h2 className="font-semibold text-lg">Acceso privado</h2>
          <div className="inline-flex rounded-full bg-slate-800 p-1">
            <button
              onClick={() => setMode("login")}
              className={`px-3 py-1 text-sm rounded-full ${
                mode === "login" ? "bg-piggy-600" : "text-slate-300"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode("register")}
              className={`px-3 py-1 text-sm rounded-full ${
                mode === "register" ? "bg-piggy-600" : "text-slate-300"
              }`}
            >
              Crear cuenta
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Para producción, aquí solo debería entrar **tu usuario** o cuentas muy controladas.
          </p>
        </div>
        <div className="flex-1">
          <AuthForm mode={mode} />
        </div>
      </section>
    </main>
  );
}
