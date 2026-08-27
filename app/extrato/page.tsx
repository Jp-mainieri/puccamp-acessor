'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { RouteGuard } from '@/components/RouteGuard';
import { EntryListItem } from '@/components/EntryListItem';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useFinance } from '@/lib/finance-context';

function ExtratoContent() {
  const router = useRouter();
  const { lancamentos, deleteLancamento } = useFinance();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const ordenados = [...lancamentos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  function handleConfirmDelete() {
    if (confirmDeleteId) {
      deleteLancamento(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold text-slate-900">Extrato</h1>

      {ordenados.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-center text-slate-500">
          <PlusCircle className="h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm">Nenhum lançamento ainda. Toque em “+” para adicionar o primeiro.</p>
          <button
            type="button"
            onClick={() => router.push('/adicionar')}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Adicionar lançamento
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {ordenados.map((lancamento) => (
            <EntryListItem
              key={lancamento.id}
              lancamento={lancamento}
              onEdit={() => router.push(`/adicionar?id=${lancamento.id}`)}
              onDeleteRequest={() => setConfirmDeleteId(lancamento.id)}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Excluir lançamento?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export default function ExtratoPage() {
  return (
    <RouteGuard>
      <ExtratoContent />
    </RouteGuard>
  );
}
