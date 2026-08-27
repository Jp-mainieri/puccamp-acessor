import type { CategoriasCustomizadas, TipoLancamento } from '@/types';

/** Chaves namespaced usadas no localStorage. */
export const STORAGE_KEYS = {
  usuario: 'bolsou:usuario',
  lancamentos: 'bolsou:lancamentos',
  categorias: 'bolsou:categorias',
} as const;

/** Categorias fixas por tipo de lançamento. "Outros" fica sempre por último — é o gatilho do campo de texto livre. */
export const DEFAULT_CATEGORIES: Record<TipoLancamento, string[]> = {
  renda: ['Trabalho', 'Mesada', 'Outros'],
  gasto: ['Transporte', 'Assinaturas', 'Aluguel', 'Mercado', 'Festas', 'Lazer', 'Bebida', 'Outros'],
  investimento: ['Renda Fixa', 'Ações', 'Fundos Imobiliários', 'Criptomoedas', 'Outros'],
};

export const OUTROS_CATEGORIA = 'Outros';

export const TIPO_LABELS: Record<TipoLancamento, string> = {
  renda: 'Renda',
  gasto: 'Gasto',
  investimento: 'Investimento',
};

export const EMPTY_CATEGORIAS_CUSTOMIZADAS: CategoriasCustomizadas = {
  renda: [],
  gasto: [],
  investimento: [],
};

/**
 * Label gramaticalmente correto em pt-BR para "toda/todo {dia da semana}", indexado por Date#getDay().
 * "sábado" e "domingo" são masculinos ("todo"); os demais dias usam "-feira" (feminino, "toda").
 */
export const WEEKDAY_TEMPLATE_LABELS: string[] = [
  'todo domingo',
  'toda segunda-feira',
  'toda terça-feira',
  'toda quarta-feira',
  'toda quinta-feira',
  'toda sexta-feira',
  'todo sábado',
];

/** Nome completo do dia da semana, indexado por Date#getDay(). */
export const WEEKDAY_LABELS: string[] = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

/** Paleta cíclica usada para colorir fatias dos gráficos de pizza (por índice, não por nome de categoria). */
export const PIE_CHART_COLORS: string[] = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#db2777', // pink-600
  '#65a30d', // lime-600
];

/** Lista completa de categorias disponíveis para um tipo: fixas (sem "Outros") + customizadas + "Outros" por último. */
export function getAllCategoriesForTipo(
  tipo: TipoLancamento,
  categoriasCustomizadas: CategoriasCustomizadas
): string[] {
  const fixas = DEFAULT_CATEGORIES[tipo].filter((categoria) => categoria !== OUTROS_CATEGORIA);
  const customizadas = categoriasCustomizadas[tipo] ?? [];
  return [...fixas, ...customizadas, OUTROS_CATEGORIA];
}

/**
 * Resolve o nome canônico de uma categoria digitada em "Outros": se já existir (fixa ou customizada,
 * comparação sem diferenciar maiúsculas/minúsculas), retorna a grafia já existente; senão, o texto aparado.
 */
export function resolveCategoriaName(
  tipo: TipoLancamento,
  nomeDigitado: string,
  categoriasCustomizadas: CategoriasCustomizadas
): string {
  const nomeAparado = nomeDigitado.trim();
  const existentes = [
    ...DEFAULT_CATEGORIES[tipo].filter((categoria) => categoria !== OUTROS_CATEGORIA),
    ...(categoriasCustomizadas[tipo] ?? []),
  ];
  const existente = existentes.find(
    (categoria) => categoria.toLocaleLowerCase('pt-BR') === nomeAparado.toLocaleLowerCase('pt-BR')
  );
  return existente ?? nomeAparado;
}

/** Verdadeiro quando o nome resolvido ainda não está nas categorias fixas nem nas customizadas salvas. */
export function isNovaCategoriaCustomizada(
  tipo: TipoLancamento,
  nomeResolvido: string,
  categoriasCustomizadas: CategoriasCustomizadas
): boolean {
  const existentes = [
    ...DEFAULT_CATEGORIES[tipo].filter((categoria) => categoria !== OUTROS_CATEGORIA),
    ...(categoriasCustomizadas[tipo] ?? []),
  ];
  return !existentes.some(
    (categoria) => categoria.toLocaleLowerCase('pt-BR') === nomeResolvido.toLocaleLowerCase('pt-BR')
  );
}
