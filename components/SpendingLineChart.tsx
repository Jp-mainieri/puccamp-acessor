'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyTotal } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';

interface SpendingLineChartProps {
  data: DailyTotal[];
}

/** Total de gastos por dia, últimos 30 dias. */
export function SpendingLineChart({ data }: SpendingLineChartProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            minTickGap={24}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelStyle={{ color: '#0f172a' }}
            contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
