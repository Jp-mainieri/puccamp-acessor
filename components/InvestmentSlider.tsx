'use client';

import { getMetaInvestimento } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';

interface InvestmentSliderProps {
  percentual: number;
  /** Soma das rendas recorrentes usada como referência para calcular o valor em R$ ao vivo. */
  rendaFixaReferencia: number;
  onChange: (percentual: number) => void;
}

/** Reusado no onboarding (passo 6) e em /configuracoes. */
export function InvestmentSlider({ percentual, rendaFixaReferencia, onChange }: InvestmentSliderProps) {
  const valorEstimado = getMetaInvestimento(rendaFixaReferencia, percentual);

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>Percentual de investimento</span>
        <span>{percentual}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={percentual}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-blue-600"
        aria-label="Percentual de investimento"
      />
      <p className="mt-2 text-sm text-slate-600">
        Isso equivale a{' '}
        <span className="font-semibold text-slate-900">{formatCurrency(valorEstimado)}</span> por mês.
      </p>
    </div>
  );
}
