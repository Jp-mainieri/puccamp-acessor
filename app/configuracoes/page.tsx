'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { RouteGuard } from '@/components/RouteGuard';
import { InvestmentSlider } from '@/components/InvestmentSlider';
import { CurrencyInput } from '@/components/CurrencyInput';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useFinance } from '@/lib/finance-context';
import { getRecurringTotal } from '@/lib/calculations';

function ConfiguracoesContent() {
  const router = useRouter();
  const { usuario, lancamentos, updateUsuario, resetAllData } = useFinance();
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!usuario) return null; // RouteGuard já garante usuario non-null em runtime; guarda só para o TS.

  const rendaFixaReferencia = getRecurringTotal(lancamentos, 'renda');
  const tetoGastosAtual = usuario.tetoGastos;
  const tetoAtivo = tetoGastosAtual !== null;

  function handleToggleTeto(ativo: boolean) {
    updateUsuario({ tetoGastos: ativo ? (tetoGastosAtual ?? 0) : null });
  }

  function handleResetConfirm() {
    resetAllData();
    setConfirmResetOpen(false);
    router.push('/onboarding');
  }

  return (
    <div className="mx-auto max-w-md space-y-8 px-4 py-6">
      <h1 className="text-xl font-semibold text-slate-900">Configurações</h1>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Investimento</h2>
        <InvestmentSlider
          percentual={usuario.percentualInvestimento}
          rendaFixaReferencia={rendaFixaReferencia}
          onChange={(percentualInvestimento) => updateUsuario({ percentualInvestimento })}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Teto de gastos mensal</h2>
          <button
            type="button"
            role="switch"
            aria-checked={tetoAtivo}
            aria-label="Ativar teto de gastos"
            onClick={() => handleToggleTeto(!tetoAtivo)}
            className={clsx(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors',
              tetoAtivo ? 'bg-blue-600' : 'bg-slate-300'
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                tetoAtivo ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
        {tetoAtivo && (
          <CurrencyInput
            value={usuario.tetoGastos ?? ''}
            onChange={(valor) => updateUsuario({ tetoGastos: valor === '' ? 0 : valor })}
            min={0.01}
          />
        )}
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-800">Zona de risco</h2>
        <p className="mt-1 text-xs text-red-700">
          Isso apaga permanentemente seu perfil, lançamentos e categorias customizadas deste navegador.
        </p>
        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Resetar todos os dados
        </button>
      </section>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Resetar todos os dados?"
        description="Essa ação é irreversível: seu perfil, lançamentos e categorias customizadas serão apagados."
        confirmLabel="Resetar"
        variant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <RouteGuard>
      <ConfiguracoesContent />
    </RouteGuard>
  );
}
