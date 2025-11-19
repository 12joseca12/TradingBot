import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "CryptoSignal",
  description: "Señales cripto inteligentes en tiempo real"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">
                CS
              </div>
              <span className="font-semibold text-lg">CryptoSignal</span>
            </div>
            <span className="text-xs text-slate-400">
              SaaS · Señales cripto
            </span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
