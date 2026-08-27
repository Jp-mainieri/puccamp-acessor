'use client';

import { Suspense } from 'react';
import { RouteGuard } from '@/components/RouteGuard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EntryForm } from '@/components/EntryForm';

// Suspense é obrigatório aqui: EntryForm usa useSearchParams() para ler o ?id= opcional.
export default function AdicionarPage() {
  return (
    <RouteGuard>
      <Suspense fallback={<LoadingScreen />}>
        <EntryForm />
      </Suspense>
    </RouteGuard>
  );
}
