import { ArrowDownCircle, ArrowUpCircle, Pencil, PiggyBank, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { Lancamento } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/format';

interface EntryListItemProps {
  lancamento: Lancamento;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

const TIPO_VISUAL: Record<Lancamento['tipo'], { icon: typeof ArrowUpCircle; className: string; sinal: string }> = {
  renda: { icon: ArrowUpCircle, className: 'text-green-600', sinal: '+' },
  gasto: { icon: ArrowDownCircle, className: 'text-red-600', sinal: '-' },
  investimento: { icon: PiggyBank, className: 'text-blue-600', sinal: '-' },
};

export function EntryListItem({ lancamento, onEdit, onDeleteRequest }: EntryListItemProps) {
  const visual = TIPO_VISUAL[lancamento.tipo];
  const Icon = visual.icon;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <Icon className={clsx('h-8 w-8 shrink-0', visual.className)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{lancamento.categoria}</p>
        <p className="text-xs text-slate-500">{formatDateTime(lancamento.data)}</p>
      </div>
      <p className={clsx('shrink-0 text-sm font-semibold', visual.className)}>
        {visual.sinal} {formatCurrency(lancamento.valor)}
      </p>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar lançamento de ${lancamento.categoria}`}
          className="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-blue-600"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDeleteRequest}
          aria-label={`Excluir lançamento de ${lancamento.categoria}`}
          className="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
