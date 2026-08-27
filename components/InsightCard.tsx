import { Lightbulb } from 'lucide-react';

interface InsightCardProps {
  message: string;
}

/** Card de insight de padrão de gasto por dia da semana, no dashboard. */
export function InsightCard({ message }: InsightCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
      <p className="text-sm text-blue-900">{message}</p>
    </div>
  );
}
