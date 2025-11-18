import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "PiggyBank",
  description: "Panel privado para operar con tu bot de trading"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-piggy-600 flex items-center justify-center text-xs font-bold">
                PB
              </div>
              <span className="font-semibold text-lg">PiggyBank</span>
            </div>
            <span className="text-xs text-slate-400">
              Bot propio · Trading real
            </span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
