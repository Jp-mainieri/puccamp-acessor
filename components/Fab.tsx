import Link from 'next/link';
import { Plus } from 'lucide-react';

/** Renderizado apenas no dashboard (`app/page.tsx`), conforme a spec. */
export function Fab() {
  return (
    <Link
      href="/adicionar"
      aria-label="Adicionar lançamento"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 active:scale-95"
    >
      <Plus className="h-7 w-7" aria-hidden="true" />
    </Link>
  );
}
