'use client';

import { RouteGuard } from '@/components/RouteGuard';
import { Fab } from '@/components/Fab';
import { SpendingLineChart } from '@/components/SpendingLineChart';
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { ProgressBar } from '@/components/ProgressBar';
import { InsightCard } from '@/components/InsightCard';
import { AlertBanner } from '@/components/AlertBanner';
import { useFinance } from '@/lib/finance-context';
import {
  buildSpendingPatternMessage,
  getCategoryTotals,
  getDailySpendingTotals,
  getInvestmentProgress,
  getSaldoAtual,
  getSpendingCapProgress,
  getSpendingPatternInsight,
} from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';

function DashboardContent() {
  const { usuario, lancamentos } = useFinance();
  if (!usuario) return null; // RouteGuard já garante usuario non-null em runtime; guarda só para o TS.

  const saldoAtual = getSaldoAtual(usuario, lancamentos);
  const dailyTotals = getDailySpendingTotals(lancamentos);
  const rendaPorCategoria = getCategoryTotals(lancamentos, 'renda');
  const gastoPorCategoria = getCategoryTotals(lancamentos, 'gasto');
  const investimentoPorCategoria = getCategoryTotals(lancamentos, 'investimento');
  const investmentProgress = getInvestmentProgress(usuario, lancamentos);
  const spendingCapProgress = getSpendingCapProgress(usuario, lancamentos);
  const insightMessage = buildSpendingPatternMessage(getSpendingPatternInsight(lancamentos));
  const tetoEstourado = spendingCapProgress.percentual !== null && spendingCapProgress.percentual > 100;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      {tetoEstourado && spendingCapProgress.tetoGastos !== null && (
        <AlertBanner variant="danger">
          Você já ultrapassou seu teto de gastos deste mês ({formatCurrency(spendingCapProgress.tetoGastos)}).
        </AlertBanner>
      )}

      <div>
        <p className="text-sm text-slate-500">Olá, {usuario.nome}</p>
        <p className="text-3xl font-bold text-slate-900">{formatCurrency(saldoAtual)}</p>
        <p className="text-xs text-slate-400">Saldo atual</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Gastos nos últimos 30 dias</h2>
        <div className="mt-2">
          <SpendingLineChart data={dailyTotals} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CategoryPieChart title="Renda por categoria" data={rendaPorCategoria} />
        <CategoryPieChart title="Gasto por categoria" data={gastoPorCategoria} />
        <CategoryPieChart title="Investimento por categoria" data={investimentoPorCategoria} />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <ProgressBar
          label="Meta de investimento"
          percentual={investmentProgress.percentual}
          helperText={`${formatCurrency(investmentProgress.totalInvestidoMes)} de ${formatCurrency(investmentProgress.metaInvestimento)}`}
          colorClassName="bg-green-600"
        />
        {spendingCapProgress.percentual !== null && spendingCapProgress.tetoGastos !== null && (
          <ProgressBar
            label="Teto de gastos"
            percentual={spendingCapProgress.percentual}
            helperText={`${formatCurrency(spendingCapProgress.totalGastoMes)} de ${formatCurrency(spendingCapProgress.tetoGastos)}`}
            colorClassName={tetoEstourado ? 'bg-red-600' : 'bg-blue-600'}
          />
        )}
      </section>

      <InsightCard message={insightMessage} />

      <Fab />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  );
}
