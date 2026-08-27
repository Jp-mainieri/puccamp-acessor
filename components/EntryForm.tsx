'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import type { TipoLancamento } from '@/types';
import { useFinance } from '@/lib/finance-context';
import { DEFAULT_CATEGORIES, OUTROS_CATEGORIA, TIPO_LABELS } from '@/lib/constants';
import { getMonthlySpendingTotalForDate } from '@/lib/calculations';
import { datetimeLocalValueToIso, formatCurrency, toDatetimeLocalValue } from '@/lib/format';
import { CategorySelector } from '@/components/CategorySelector';
import { CurrencyInput } from '@/components/CurrencyInput';
import { AlertBanner } from '@/components/AlertBanner';

const TIPOS: TipoLancamento[] = ['renda', 'gasto', 'investimento'];

// Usa useSearchParams (client-only) — o componente precisa estar dentro de um <Suspense> no page.tsx.
export function EntryForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const router = useRouter();
  const { usuario, lancamentos, addLancamento, updateLancamento } = useFinance();

  // O RouteGuard garante que o contexto já hidratou antes deste componente montar, então
  // `lancamentos` aqui já reflete o localStorage — não precisa de um efeito para "alcançar" o dado depois.
  const lancamentoExistente = editId ? lancamentos.find((l) => l.id === editId) ?? null : null;

  const [tipo, setTipo] = useState<TipoLancamento>(lancamentoExistente?.tipo ?? 'gasto');
  const [categoria, setCategoria] = useState(lancamentoExistente?.categoria ?? DEFAULT_CATEGORIES[tipo][0]);
  const [valor, setValor] = useState<number | ''>(lancamentoExistente?.valor ?? '');
  const [dataHora, setDataHora] = useState(
    lancamentoExistente ? toDatetimeLocalValue(new Date(lancamentoExistente.data)) : toDatetimeLocalValue(new Date())
  );
  const [recorrente, setRecorrente] = useState(lancamentoExistente?.recorrente ?? false);

  function handleTipoChange(novoTipo: TipoLancamento) {
    setTipo(novoTipo);
    setCategoria(DEFAULT_CATEGORIES[novoTipo][0]);
  }

  const dataReferencia = dataHora ? new Date(dataHora) : new Date();
  const totalMesComEsseGasto =
    tipo === 'gasto' && valor !== ''
      ? getMonthlySpendingTotalForDate(lancamentos, dataReferencia, lancamentoExistente?.id) + valor
      : 0;
  const ultrapassaTeto =
    tipo === 'gasto' &&
    valor !== '' &&
    valor > 0 &&
    usuario?.tetoGastos != null &&
    totalMesComEsseGasto > usuario.tetoGastos;

  const podeSalvar = categoria !== OUTROS_CATEGORIA && valor !== '' && valor > 0 && dataHora !== '';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (valor === '' || !podeSalvar) return;

    const input = { tipo, categoria, valor, data: datetimeLocalValueToIso(dataHora), recorrente };

    if (lancamentoExistente) {
      updateLancamento(lancamentoExistente.id, input);
    } else {
      addLancamento(input);
    }
    router.push('/extrato');
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5 px-4 py-6">
      <h1 className="text-xl font-semibold text-slate-900">
        {lancamentoExistente ? 'Editar lançamento' : 'Novo lançamento'}
      </h1>

      <div>
        <span className="block text-sm font-medium text-slate-700">Tipo</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {TIPOS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => handleTipoChange(opcao)}
              className={clsx(
                'rounded-lg border px-3 py-2 text-sm font-medium',
                tipo === opcao ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'
              )}
            >
              {TIPO_LABELS[opcao]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Valor</label>
        <div className="mt-1">
          <CurrencyInput value={valor} onChange={setValor} min={0.01} />
        </div>
      </div>

      <CategorySelector tipo={tipo} value={categoria} onChange={setCategoria} />

      <div>
        <label htmlFor="data-hora" className="block text-sm font-medium text-slate-700">
          Data e hora
        </label>
        <input
          id="data-hora"
          type="datetime-local"
          value={dataHora}
          onChange={(event) => setDataHora(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2.5">
        <input
          type="checkbox"
          checked={recorrente}
          onChange={(event) => setRecorrente(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-slate-700">
          <span className="block font-medium">Lançamento recorrente</span>
          <span className="block text-xs text-slate-500">Repete todo mês — ex.: salário, aluguel, assinatura.</span>
        </span>
      </label>

      {ultrapassaTeto && usuario?.tetoGastos != null && (
        <AlertBanner variant="warning">
          Esse gasto leva o total do mês para {formatCurrency(totalMesComEsseGasto)}, acima do seu teto de{' '}
          {formatCurrency(usuario.tetoGastos)}. Isso é só um alerta — o lançamento pode ser salvo normalmente.
        </AlertBanner>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/extrato')}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!podeSalvar}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
