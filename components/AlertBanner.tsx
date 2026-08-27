import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface AlertBannerProps {
  variant: 'warning' | 'danger';
  children: ReactNode;
}

/** Reusado no alerta de teto do formulário de lançamento e no banner de estouro de teto do dashboard. */
export function AlertBanner({ variant, children }: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-2 rounded-xl border px-4 py-3 text-sm',
        variant === 'danger'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-yellow-200 bg-yellow-50 text-yellow-800'
      )}
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
