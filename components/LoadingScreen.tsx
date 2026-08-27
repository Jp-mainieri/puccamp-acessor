import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
