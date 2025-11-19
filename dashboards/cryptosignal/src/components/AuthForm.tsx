"use client";

import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/src/store/authStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface Props {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: Props) {
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
          email,
          password
        });
        setToken(res.data.token);
      } else {
        const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
          email,
          password,
          affiliateCode: affiliateCode || undefined
        });
        setToken(res.data.token);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Error en la petición.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4"
    >
      <div className="space-y-1">
        <label className="text-xs text-slate-300">Email</label>
        <input
          type="email"
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-sm outline-none focus:border-brand-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-slate-300">Contraseña</label>
        <input
          type="password"
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-sm outline-none focus:border-brand-500"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {mode === "register" && (
        <div className="space-y-1">
          <label className="text-xs text-slate-300">
            Código de afiliado (opcional)
          </label>
          <input
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-sm outline-none focus:border-brand-500"
            value={affiliateCode}
            onChange={(e) => setAffiliateCode(e.target.value)}
            placeholder="Ej: ab12cd34"
          />
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-600 hover:bg-brand-500 transition text-sm font-medium py-1.5 disabled:opacity-60"
      >
        {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Registrarme"}
      </button>
    </form>
  );
}

