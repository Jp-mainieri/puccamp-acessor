import type { GastoRecorrente, Lancamento, RendaRecorrente, TipoLancamento, Usuario } from '@/types';
import { WEEKDAY_TEMPLATE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateShort } from '@/lib/format';

// Todas as funções aqui são puras (sem React, sem storage) — recebem dados e devolvem números/objetos.

function sumValores<T extends { valor: number }>(items: T[]): number {
  return items.reduce((total, item) => total + item.valor, 0);
}

/** saldoInicial + Σrenda - Σgasto - Σinvestimento, considerando TODOS os lançamentos já registrados. */
export function getSaldoAtual(usuario: Usuario, lancamentos: Lancamento[]): number {
  const renda = sumValores(lancamentos.filter((l) => l.tipo === 'renda'));
  const gasto = sumValores(lancamentos.filter((l) => l.tipo === 'gasto'));
  const investimento = sumValores(lancamentos.filter((l) => l.tipo === 'investimento'));
  return usuario.saldoInicial + renda - gasto - investimento;
}

export function getRendaFixaTotal(rendasRecorrentes: RendaRecorrente[]): number {
  return sumValores(rendasRecorrentes);
}

export function getGastoFixoTotal(gastosRecorrentes: GastoRecorrente[]): number {
  return sumValores(gastosRecorrentes);
}

export function getSaldoLivre(rendaFixa: number, gastoFixo: number): number {
  return rendaFixa - gastoFixo;
}

export function getMetaInvestimento(rendaFixa: number, percentualInvestimento: number): number {
  return rendaFixa * (percentualInvestimento / 100);
}

export function getMaiorGastoFixo(gastosRecorrentes: GastoRecorrente[]): GastoRecorrente | undefined {
  if (gastosRecorrentes.length === 0) return undefined;
  return gastosRecorrentes.reduce((maior, atual) => (atual.valor > maior.valor ? atual : maior));
}

/** Lançamentos marcados `recorrente` para o tipo dado (qualquer data — representam um compromisso contínuo, não um mês específico). */
export function getRecurringLancamentos(lancamentos: Lancamento[], tipo: TipoLancamento): Lancamento[] {
  return lancamentos.filter((l) => l.tipo === tipo && l.recorrente);
}

/** Soma de todos os lançamentos recorrentes de um tipo — é o equivalente, pós-onboarding, de rendaFixa/gastoFixo. */
export function getRecurringTotal(lancamentos: Lancamento[], tipo: TipoLancamento): number {
  return sumValores(getRecurringLancamentos(lancamentos, tipo));
}

// --- Onboarding -------------------------------------------------------------

export interface OnboardingSummary {
  rendaFixa: number;
  gastoFixo: number;
  saldoLivre: number;
  metaInvestimento: number;
  percentualInvestimento: number;
  maiorGastoFixo: GastoRecorrente | undefined;
}

export function getOnboardingSummary(
  rendasRecorrentes: RendaRecorrente[],
  gastosRecorrentes: GastoRecorrente[],
  percentualInvestimento: number
): OnboardingSummary {
  const rendaFixa = getRendaFixaTotal(rendasRecorrentes);
  const gastoFixo = getGastoFixoTotal(gastosRecorrentes);
  const saldoLivre = getSaldoLivre(rendaFixa, gastoFixo);
  const metaInvestimento = getMetaInvestimento(rendaFixa, percentualInvestimento);
  const maiorGastoFixo = getMaiorGastoFixo(gastosRecorrentes);
  return { rendaFixa, gastoFixo, saldoLivre, metaInvestimento, percentualInvestimento, maiorGastoFixo };
}

export type OnboardingInsightStatus = 'alert' | 'neutral' | 'positive' | 'warning';

export interface OnboardingInsight {
  status: OnboardingInsightStatus;
  message: string;
}

/**
 * Implementa, nesta ordem exata, as 5 ramificações da spec — a primeira condição verdadeira vence.
 */
export function getOnboardingInsight(summary: OnboardingSummary): OnboardingInsight {
  const { rendaFixa, gastoFixo, saldoLivre, metaInvestimento, percentualInvestimento, maiorGastoFixo } = summary;

  if (gastoFixo > rendaFixa) {
    let message = `Seus gastos fixos superam sua renda em ${formatCurrency(gastoFixo - rendaFixa)}.`;
    if (maiorGastoFixo) {
      message += ` Considere cortar ou reduzir o gasto com ${maiorGastoFixo.categoria} para equilibrar as contas.`;
    }
    return { status: 'alert', message };
  }

  if (percentualInvestimento === 0) {
    return {
      status: 'neutral',
      message: `Depois dos seus gastos fixos, sobram ${formatCurrency(saldoLivre)} por mês. Você optou por não investir por enquanto — dá pra definir uma meta de investimento quando quiser, lá em Configurações.`,
    };
  }

  if (saldoLivre >= metaInvestimento) {
    return {
      status: 'positive',
      message: `Orçamento saudável! Dá pra investir ${formatCurrency(metaInvestimento)} por mês e ainda sobram ${formatCurrency(saldoLivre - metaInvestimento)} de folga.`,
    };
  }

  if (saldoLivre > 0) {
    let message = `Sobram ${formatCurrency(saldoLivre)} por mês, mas isso é menos que sua meta de investimento de ${formatCurrency(metaInvestimento)}.`;
    if (maiorGastoFixo) {
      message += ` Rever o gasto com ${maiorGastoFixo.categoria} pode ajudar a fechar essa diferença.`;
    }
    return { status: 'warning', message };
  }

  // saldoLivre === 0
  let message = 'Sua renda e seus gastos fixos se equilibram exatamente — não sobra nem falta nada por mês.';
  if (maiorGastoFixo) {
    message += ` Reduzir o gasto com ${maiorGastoFixo.categoria} seria um caminho pra abrir espaço e conseguir investir.`;
  }
  return { status: 'neutral', message };
}

// --- Totais mensais / por data ----------------------------------------------

/** Compara ano/mês usando componentes LOCAIS (nunca getUTC*), já que `iso` representa um instante escolhido pelo usuário. */
export function isSameMonth(iso: string, referenceDate: Date): boolean {
  const date = new Date(iso);
  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

export function getTotalByTipoNoMes(
  lancamentos: Lancamento[],
  tipo: TipoLancamento,
  referenceDate: Date = new Date()
): number {
  return sumValores(lancamentos.filter((l) => l.tipo === tipo && isSameMonth(l.data, referenceDate)));
}

/**
 * Total de gastos no mesmo ano/mês de `referenceDate`, opcionalmente excluindo um lançamento por id
 * (usado ao editar um gasto existente, para não contar o valor antigo dele em dobro no alerta de teto).
 */
export function getMonthlySpendingTotalForDate(
  lancamentos: Lancamento[],
  referenceDate: Date,
  excludeId?: string
): number {
  return sumValores(
    lancamentos.filter(
      (l) => l.tipo === 'gasto' && l.id !== excludeId && isSameMonth(l.data, referenceDate)
    )
  );
}

// --- Agregação por categoria (pizzas do dashboard) --------------------------

export interface CategoryTotal {
  categoria: string;
  total: number;
}

/** Agrupa por categoria dentro do mês de `referenceDate` (mês corrente por padrão); só inclui totais > 0. */
export function getCategoryTotals(
  lancamentos: Lancamento[],
  tipo: TipoLancamento,
  referenceDate: Date = new Date()
): CategoryTotal[] {
  const totais = new Map<string, number>();
  for (const lancamento of lancamentos) {
    if (lancamento.tipo !== tipo || !isSameMonth(lancamento.data, referenceDate)) continue;
    totais.set(lancamento.categoria, (totais.get(lancamento.categoria) ?? 0) + lancamento.valor);
  }
  return Array.from(totais.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total);
}

// --- Agregação diária (gráfico de linha, últimos N dias) --------------------

export interface DailyTotal {
  date: string; // yyyy-MM-dd local
  label: string; // ex. "27/08"
  total: number;
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Gera `days` baldes diários contínuos (preenchendo zero nos dias sem gasto), do mais antigo ao mais recente. */
export function getDailySpendingTotals(
  lancamentos: Lancamento[],
  days: number = 30,
  referenceDate: Date = new Date()
): DailyTotal[] {
  const dias: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dias.push(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - i));
  }

  const totaisPorDia = new Map<string, number>(dias.map((dia) => [dayKey(dia), 0]));

  for (const lancamento of lancamentos) {
    if (lancamento.tipo !== 'gasto') continue;
    const key = dayKey(new Date(lancamento.data));
    if (totaisPorDia.has(key)) {
      totaisPorDia.set(key, (totaisPorDia.get(key) ?? 0) + lancamento.valor);
    }
  }

  return dias.map((dia) => {
    const key = dayKey(dia);
    return { date: key, label: formatDateShort(dia.toISOString()), total: totaisPorDia.get(key) ?? 0 };
  });
}

// --- Progresso (dashboard) ---------------------------------------------------

export interface InvestmentProgress {
  totalInvestidoMes: number;
  metaInvestimento: number;
  percentual: number;
}

export function getInvestmentProgress(usuario: Usuario, lancamentos: Lancamento[]): InvestmentProgress {
  const totalInvestidoMes = getTotalByTipoNoMes(lancamentos, 'investimento');
  const rendaFixa = getRecurringTotal(lancamentos, 'renda');
  const metaInvestimento = getMetaInvestimento(rendaFixa, usuario.percentualInvestimento);
  const percentual = metaInvestimento > 0 ? (totalInvestidoMes / metaInvestimento) * 100 : 0;
  return { totalInvestidoMes, metaInvestimento, percentual };
}

export interface SpendingCapProgress {
  totalGastoMes: number;
  tetoGastos: number | null;
  percentual: number | null;
}

export function getSpendingCapProgress(usuario: Usuario, lancamentos: Lancamento[]): SpendingCapProgress {
  const totalGastoMes = getTotalByTipoNoMes(lancamentos, 'gasto');
  const { tetoGastos } = usuario;

  if (tetoGastos === null) {
    return { totalGastoMes, tetoGastos: null, percentual: null };
  }

  const percentual =
    tetoGastos > 0 ? (totalGastoMes / tetoGastos) * 100 : totalGastoMes > 0 ? Infinity : 0;
  return { totalGastoMes, tetoGastos, percentual };
}

// --- Insight de padrão de gasto por dia da semana ---------------------------

export interface SpendingPatternInsight {
  categoria: string;
  diaSemana: number; // 0-6, Date#getDay()
  totalNoDia: number;
  totalCategoria: number;
  quantidadeNoDia: number;
}

/**
 * Considera TODO o histórico de lançamentos tipo 'gasto' (é um padrão de comportamento, não uma
 * métrica do mês corrente). Qualifica quando um dia da semana concentra >= 50% do valor total da
 * categoria E tem >= 3 lançamentos naquele dia. Entre categorias qualificadas, desempata pela de
 * maior gasto total acumulado.
 */
export function getSpendingPatternInsight(lancamentos: Lancamento[]): SpendingPatternInsight | null {
  const gastos = lancamentos.filter((l) => l.tipo === 'gasto');

  const totalPorCategoria = new Map<string, number>();
  const porCategoriaEDia = new Map<string, Map<number, { total: number; quantidade: number }>>();

  for (const gasto of gastos) {
    totalPorCategoria.set(gasto.categoria, (totalPorCategoria.get(gasto.categoria) ?? 0) + gasto.valor);

    const diaSemana = new Date(gasto.data).getDay();
    const porDia = porCategoriaEDia.get(gasto.categoria) ?? new Map<number, { total: number; quantidade: number }>();
    const atual = porDia.get(diaSemana) ?? { total: 0, quantidade: 0 };
    porDia.set(diaSemana, { total: atual.total + gasto.valor, quantidade: atual.quantidade + 1 });
    porCategoriaEDia.set(gasto.categoria, porDia);
  }

  const candidatos: SpendingPatternInsight[] = [];

  for (const [categoria, porDia] of porCategoriaEDia.entries()) {
    const totalCategoria = totalPorCategoria.get(categoria) ?? 0;
    if (totalCategoria <= 0) continue;

    for (const [diaSemana, { total, quantidade }] of porDia.entries()) {
      const concentracao = total / totalCategoria;
      if (quantidade >= 3 && concentracao >= 0.5) {
        candidatos.push({ categoria, diaSemana, totalNoDia: total, totalCategoria, quantidadeNoDia: quantidade });
      }
    }
  }

  if (candidatos.length === 0) return null;

  candidatos.sort((a, b) => b.totalCategoria - a.totalCategoria);
  return candidatos[0];
}

export function buildSpendingPatternMessage(insight: SpendingPatternInsight | null): string {
  if (!insight) {
    return 'Continue registrando seus gastos para que a gente possa identificar padrões e te dar dicas personalizadas.';
  }
  const diaTemplate = WEEKDAY_TEMPLATE_LABELS[insight.diaSemana];
  return `Você está gastando muito com ${insight.categoria} ${diaTemplate}!`;
}
