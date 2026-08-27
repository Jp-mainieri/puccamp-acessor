'use client';

import { useState } from 'react';
import type { TipoLancamento } from '@/types';
import { useFinance } from '@/lib/finance-context';
import {
  getAllCategoriesForTipo,
  isNovaCategoriaCustomizada,
  OUTROS_CATEGORIA,
  resolveCategoriaName,
} from '@/lib/constants';

interface CategorySelectorProps {
  tipo: TipoLancamento;
  value: string;
  onChange: (categoria: string) => void;
  label?: string;
  id?: string;
}

/**
 * Seletor de categoria dependente do tipo. `mostrarCampoLivre` é DERIVADO de `value === 'Outros'`
 * (não é um estado próprio) para não ficar dessincronizado quando o `tipo`/`value` muda por fora
 * (ex.: ao trocar o tipo de lançamento no formulário).
 */
export function CategorySelector({ tipo, value, onChange, label = 'Categoria', id }: CategorySelectorProps) {
  const { categoriasCustomizadas, addCategoriaCustomizada } = useFinance();
  const opcoes = getAllCategoriesForTipo(tipo, categoriasCustomizadas);
  const mostrarCampoLivre = value === OUTROS_CATEGORIA;
  const [textoLivre, setTextoLivre] = useState('');

  function confirmarTextoLivre() {
    if (!textoLivre.trim()) return;
    const nomeResolvido = resolveCategoriaName(tipo, textoLivre, categoriasCustomizadas);
    if (isNovaCategoriaCustomizada(tipo, nomeResolvido, categoriasCustomizadas)) {
      addCategoriaCustomizada(tipo, nomeResolvido);
    }
    setTextoLivre('');
    onChange(nomeResolvido);
  }

  const inputId = id ?? `category-selector-${tipo}`;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {opcoes.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>

      {mostrarCampoLivre && (
        <input
          type="text"
          autoFocus
          placeholder="Digite o nome da categoria e pressione Enter"
          value={textoLivre}
          onChange={(event) => setTextoLivre(event.target.value)}
          onBlur={confirmarTextoLivre}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              confirmarTextoLivre();
            }
          }}
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
    </div>
  );
}
