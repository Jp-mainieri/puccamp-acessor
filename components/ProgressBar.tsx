import clsx from 'clsx';

interface ProgressBarProps {
  label: string;
  /** Pode passar de 100 — a barra visual é limitada em 100%, mas o texto numérico mostra o valor real. */
  percentual: number;
  /** Texto livre já formatado pelo chamador (ex.: "R$ 150,00 de R$ 500,00"). */
  helperText?: string;
  colorClassName?: string;
}

export function ProgressBar({ label, percentual, helperText, colorClassName = 'bg-blue-600' }: ProgressBarProps) {
  const larguraVisual = Math.min(Math.max(percentual, 0), 100);
  const percentualTexto = Number.isFinite(percentual) ? `${Math.round(percentual)}%` : '>999%';

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{percentualTexto}</span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={clsx('h-full rounded-full transition-all', colorClassName)}
          style={{ width: `${larguraVisual}%` }}
        />
      </div>
      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
