'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useFinance } from '@/lib/finance-context';
import { LoadingScreen } from '@/components/LoadingScreen';

/**
 * Protege `/`, `/adicionar`, `/extrato` e `/configuracoes`: enquanto o contexto não hidratou, ou
 * depois de hidratar mas sem `usuario` salvo, mostra um loading e redireciona para `/onboarding`.
 * As páginas filhas podem assumir `usuario` non-null.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { usuario, hydrated } = useFinance();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !usuario) {
      router.replace('/onboarding');
    }
  }, [hydrated, usuario, router]);

  if (!hydrated || !usuario) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
