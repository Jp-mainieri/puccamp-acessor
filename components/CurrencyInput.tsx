interface CurrencyInputProps {
  id?: string;
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  autoFocus?: boolean;
  min?: number;
}

/**
 * Input numérico com prefixo "R$". Não faz máscara de milhar (decisão do projeto: `type="number"`
 * puro); `Intl.NumberFormat` é usado só na exibição, em outros componentes.
 */
export function CurrencyInput({ id, value, onChange, placeholder = '0,00', autoFocus, min }: CurrencyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        R$
      </span>
      <input
        id={id}
        type="number"
        step="0.01"
        min={min}
        inputMode="decimal"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
