'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, Settings } from 'lucide-react';
import clsx from 'clsx';

const ITEMS = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/extrato', label: 'Extrato', icon: Receipt },
  { href: '/configuracoes', label: 'Ajustes', icon: Settings },
] as const;

/** Navegação fixa entre as telas principais. Oculta no onboarding, que é um fluxo à parte. */
export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/onboarding') return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-1 py-2.5 text-xs font-medium',
                  ativo ? 'text-blue-600' : 'text-slate-500'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
