'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryTotal } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { PIE_CHART_COLORS } from '@/lib/constants';

interface CategoryPieChartProps {
  title: string;
  data: CategoryTotal[];
}

/** Distribuição por categoria no mês corrente, para Renda / Gasto / Investimento. */
export function CategoryPieChart({ title, data }: CategoryPieChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {data.length === 0 ? (
        <p className="flex h-40 items-center justify-center text-center text-sm text-slate-400">
          Sem dados este mês
        </p>
      ) : (
        <>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="categoria"
                  innerRadius={36}
                  outerRadius={64}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.categoria} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1">
            {data.map((entry, index) => (
              <li key={entry.categoria} className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}
                  />
                  {entry.categoria}
                </span>
                <span className="font-medium text-slate-700">{formatCurrency(entry.total)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
