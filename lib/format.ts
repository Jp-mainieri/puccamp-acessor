// Formatação de moeda e data em pt-BR. Centralizado aqui para não espalhar `Intl.*` pelo app.

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const dateShortFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Ex.: "27/08/2026 14:30". */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** Ex.: "27/08" — usado como label curto em eixos de gráfico. */
export function formatDateShort(iso: string): string {
  return dateShortFormatter.format(new Date(iso));
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Monta o valor esperado por `<input type="datetime-local">` (yyyy-MM-ddTHH:mm) a partir de uma Date,
 * usando os componentes LOCAIS. Nunca usar `date.toISOString().slice(0, 16)` aqui — isso resultaria
 * na hora em UTC, desalinhada do horário local que o input exibe.
 */
export function toDatetimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converte o valor de um `<input type="datetime-local">` (sem timezone, portanto interpretado pelo
 * engine JS como hora local) para uma string ISO (UTC) pronta para persistir.
 */
export function datetimeLocalValueToIso(value: string): string {
  return new Date(value).toISOString();
}
