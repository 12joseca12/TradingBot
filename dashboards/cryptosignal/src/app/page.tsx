"use client";

import { useState } from "react";
import AuthForm from "@/components/AuthForm";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Señales cripto con IA · <span className="text-brand-500">CryptoSignal</span>
        </h1>
        <p className="text-slate-400 max-w-xl">
          Recibe entradas y salidas basadas en análisis cuantitativo y modelos de IA.
          Este panel es solo para <strong>visualizar señales</strong>, no opera tu dinero.
        </p>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <h2 className="font-semibold text-lg">Accede a tu cuenta</h2>
          <div className="inline-flex rounded-full bg-slate-800 p-1">
            <button
              onClick={() => setMode("login")}
              className={`px-3 py-1 text-sm rounded-full ${
                mode === "login" ? "bg-brand-600" : "text-slate-300"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode("register")}
              className={`px-3 py-1 text-sm rounded-full ${
                mode === "register" ? "bg-brand-600" : "text-slate-300"
              }`}
            >
              Crear cuenta
            </button>
          </div>
          <p className="text-xs text-slate-400">
            El registro en CryptoSignal usa la API del backend para crear tu usuario (con periodo de prueba).
          </p>
        </div>
        <div className="flex-1">
          <AuthForm mode={mode} />
        </div>
      </section>
    </main>
  );
}
