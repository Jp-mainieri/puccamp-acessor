import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FinanceProvider } from "@/lib/finance-context";
import { BottomNav } from "@/components/BottomNav";

// Sem next/font/google de propósito: o app não pode ter nenhuma dependência de rede além dos
// pacotes npm instalados localmente, nem mesmo no build. Usamos a stack de fontes do sistema.

export const metadata: Metadata = {
  title: "BolsoU",
  description: "Gestão financeira pessoal para estudantes universitários.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <FinanceProvider>
          <div className="flex-1 pb-20">{children}</div>
          <BottomNav />
        </FinanceProvider>
      </body>
    </html>
  );
}
