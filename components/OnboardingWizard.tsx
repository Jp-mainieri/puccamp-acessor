'use client';

import { useReducer, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { GastoRecorrente, RendaRecorrente, TipoLancamento, Usuario } from '@/types';
import { useFinance } from '@/lib/finance-context';
import { generateId } from '@/lib/storage';
import { DEFAULT_CATEGORIES, OUTROS_CATEGORIA } from '@/lib/constants';
import {
  getOnboardingInsight,
  getOnboardingSummary,
  getRendaFixaTotal,
  type OnboardingInsightStatus,
} from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { ProgressBar } from '@/components/ProgressBar';
import { CategorySelector } from '@/components/CategorySelector';
import { CurrencyInput } from '@/components/CurrencyInput';
import { InvestmentSlider } from '@/components/InvestmentSlider';

const TOTAL_STEPS = 7;

interface OnboardingState {
  step: number;
  nome: string;
  saldoInicial: number | '';
  temRendaRecorrente: boolean | null;
  rendasRecorrentes: RendaRecorrente[];
  temGastoRecorrente: boolean | null;
  gastosRecorrentes: GastoRecorrente[];
  temTetoGastos: boolean | null;
  tetoGastos: number | null;
  querInvestir: boolean | null;
  percentualInvestimento: number;
}

type OnboardingAction =
  | { type: 'SET_NOME'; nome: string }
  | { type: 'SET_SALDO_INICIAL'; valor: number | '' }
  | { type: 'SET_TEM_RENDA'; valor: boolean }
  | { type: 'ADD_RENDA'; item: RendaRecorrente }
  | { type: 'REMOVE_RENDA'; id: string }
  | { type: 'SET_TEM_GASTO'; valor: boolean }
  | { type: 'ADD_GASTO'; item: GastoRecorrente }
  | { type: 'REMOVE_GASTO'; id: string }
  | { type: 'SET_TEM_TETO'; valor: boolean }
  | { type: 'SET_TETO_GASTOS'; valor: number | null }
  | { type: 'SET_QUER_INVESTIR'; valor: boolean }
  | { type: 'SET_PERCENTUAL_INVESTIMENTO'; valor: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' };

const INITIAL_STATE: OnboardingState = {
  step: 1,
  nome: '',
  saldoInicial: '',
  temRendaRecorrente: null,
  rendasRecorrentes: [],
  temGastoRecorrente: null,
  gastosRecorrentes: [],
  temTetoGastos: null,
  tetoGastos: null,
  querInvestir: null,
  percentualInvestimento: 0,
};

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_NOME':
      return { ...state, nome: action.nome };
    case 'SET_SALDO_INICIAL':
      return { ...state, saldoInicial: action.valor };
    case 'SET_TEM_RENDA':
      return {
        ...state,
        temRendaRecorrente: action.valor,
        rendasRecorrentes: action.valor ? state.rendasRecorrentes : [],
      };
    case 'ADD_RENDA':
      return { ...state, rendasRecorrentes: [...state.rendasRecorrentes, action.item] };
    case 'REMOVE_RENDA':
      return { ...state, rendasRecorrentes: state.rendasRecorrentes.filter((item) => item.id !== action.id) };
    case 'SET_TEM_GASTO':
      return {
        ...state,
        temGastoRecorrente: action.valor,
        gastosRecorrentes: action.valor ? state.gastosRecorrentes : [],
      };
    case 'ADD_GASTO':
      return { ...state, gastosRecorrentes: [...state.gastosRecorrentes, action.item] };
    case 'REMOVE_GASTO':
      return { ...state, gastosRecorrentes: state.gastosRecorrentes.filter((item) => item.id !== action.id) };
    case 'SET_TEM_TETO':
      return { ...state, temTetoGastos: action.valor, tetoGastos: action.valor ? state.tetoGastos : null };
    case 'SET_TETO_GASTOS':
      return { ...state, tetoGastos: action.valor };
    case 'SET_QUER_INVESTIR':
      return {
        ...state,
        querInvestir: action.valor,
        percentualInvestimento: action.valor ? state.percentualInvestimento : 0,
      };
    case 'SET_PERCENTUAL_INVESTIMENTO':
      return { ...state, percentualInvestimento: action.valor };
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS) };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) };
    default:
      return state;
  }
}

function canAdvance(state: OnboardingState): boolean {
  switch (state.step) {
    case 1:
      return state.nome.trim().length > 0;
    case 2:
      return state.saldoInicial !== '' && Number.isFinite(state.saldoInicial);
    case 3:
      return state.temRendaRecorrente !== null;
    case 4:
      return state.temGastoRecorrente !== null;
    case 5:
      return state.temTetoGastos !== null && (!state.temTetoGastos || (state.tetoGastos !== null && state.tetoGastos > 0));
    case 6:
      return state.querInvestir !== null;
    default:
      return true;
  }
}

const INSIGHT_STYLES: Record<OnboardingInsightStatus, string> = {
  alert: 'border-red-200 bg-red-50 text-red-800',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  positive: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
};

export function OnboardingWizard() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { setUsuario } = useFinance();
  const router = useRouter();
  const podeAvancar = canAdvance(state);

  function handleFinish() {
    const usuario: Usuario = {
      nome: state.nome.trim(),
      saldoInicial: state.saldoInicial === '' ? 0 : state.saldoInicial,
      rendasRecorrentes: state.rendasRecorrentes,
      gastosRecorrentes: state.gastosRecorrentes,
      percentualInvestimento: state.querInvestir ? state.percentualInvestimento : 0,
      tetoGastos: state.temTetoGastos ? state.tetoGastos : null,
      criadoEm: new Date().toISOString(),
    };
    setUsuario(usuario);
    router.push('/');
  }

  const summary = getOnboardingSummary(
    state.rendasRecorrentes,
    state.gastosRecorrentes,
    state.querInvestir ? state.percentualInvestimento : 0
  );
  const insight = getOnboardingInsight(summary);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <ProgressBar label={`Passo ${state.step} de ${TOTAL_STEPS}`} percentual={(state.step / TOTAL_STEPS) * 100} />

      <div className="mt-6 flex-1">
        {state.step === 1 && (
          <StepShell title="Como podemos te chamar?">
            <input
              type="text"
              autoFocus
              value={state.nome}
              onChange={(event) => dispatch({ type: 'SET_NOME', nome: event.target.value })}
              placeholder="Seu nome"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </StepShell>
        )}

        {state.step === 2 && (
          <StepShell title="Qual é o saldo atual da sua conta?">
            <CurrencyInput
              autoFocus
              value={state.saldoInicial}
              onChange={(valor) => dispatch({ type: 'SET_SALDO_INICIAL', valor })}
            />
          </StepShell>
        )}

        {state.step === 3 && (
          <StepShell title="Você tem alguma renda recorrente?">
            <YesNoToggle value={state.temRendaRecorrente} onChange={(valor) => dispatch({ type: 'SET_TEM_RENDA', valor })} />
            {state.temRendaRecorrente && (
              <RecurringEntryEditor
                tipo="renda"
                items={state.rendasRecorrentes}
                onAdd={(item) => dispatch({ type: 'ADD_RENDA', item })}
                onRemove={(id) => dispatch({ type: 'REMOVE_RENDA', id })}
              />
            )}
          </StepShell>
        )}

        {state.step === 4 && (
          <StepShell title="E algum gasto recorrente?">
            <YesNoToggle value={state.temGastoRecorrente} onChange={(valor) => dispatch({ type: 'SET_TEM_GASTO', valor })} />
            {state.temGastoRecorrente && (
              <RecurringEntryEditor
                tipo="gasto"
                items={state.gastosRecorrentes}
                onAdd={(item) => dispatch({ type: 'ADD_GASTO', item })}
                onRemove={(id) => dispatch({ type: 'REMOVE_GASTO', id })}
              />
            )}
          </StepShell>
        )}

        {state.step === 5 && (
          <StepShell title="Quer definir um teto de gastos mensal?">
            <YesNoToggle value={state.temTetoGastos} onChange={(valor) => dispatch({ type: 'SET_TEM_TETO', valor })} />
            {state.temTetoGastos && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Valor do teto</label>
                <div className="mt-1">
                  <CurrencyInput
                    value={state.tetoGastos ?? ''}
                    onChange={(valor) => dispatch({ type: 'SET_TETO_GASTOS', valor: valor === '' ? null : valor })}
                  />
                </div>
              </div>
            )}
          </StepShell>
        )}

        {state.step === 6 && (
          <StepShell title="Quer investir parte da sua renda todo mês?">
            <YesNoToggle value={state.querInvestir} onChange={(valor) => dispatch({ type: 'SET_QUER_INVESTIR', valor })} />
            {state.querInvestir && (
              <InvestmentSlider
                percentual={state.percentualInvestimento}
                rendaFixaReferencia={getRendaFixaTotal(state.rendasRecorrentes)}
                onChange={(valor) => dispatch({ type: 'SET_PERCENTUAL_INVESTIMENTO', valor })}
              />
            )}
          </StepShell>
        )}

        {state.step === 7 && (
          <StepShell title="Tudo pronto!">
            <div className="space-y-2 rounded-xl bg-slate-100 p-4 text-sm">
              <SummaryRow label="Renda fixa total" value={formatCurrency(summary.rendaFixa)} />
              <SummaryRow label="Gasto fixo total" value={formatCurrency(summary.gastoFixo)} />
              <SummaryRow label="Saldo livre" value={formatCurrency(summary.saldoLivre)} />
            </div>
            <div className={clsx('mt-4 rounded-xl border p-4 text-sm', INSIGHT_STYLES[insight.status])}>
              {insight.message}
            </div>
          </StepShell>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {state.step > 1 && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'PREV_STEP' })}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Voltar
          </button>
        )}
        {state.step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => dispatch({ type: 'NEXT_STEP' })}
            disabled={!podeAvancar}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ir para o dashboard
          </button>
        )}
      </div>
    </div>
  );
}

function StepShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function YesNoToggle({ value, onChange }: { value: boolean | null; onChange: (valor: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={clsx(
          'flex-1 rounded-xl border px-4 py-3 text-sm font-medium',
          value === true ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'
        )}
      >
        Sim
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={clsx(
          'flex-1 rounded-xl border px-4 py-3 text-sm font-medium',
          value === false ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'
        )}
      >
        Não
      </button>
    </div>
  );
}

interface RecurringEntryEditorProps {
  tipo: Extract<TipoLancamento, 'renda' | 'gasto'>;
  items: { id: string; categoria: string; valor: number }[];
  onAdd: (item: { id: string; categoria: string; valor: number }) => void;
  onRemove: (id: string) => void;
}

function RecurringEntryEditor({ tipo, items, onAdd, onRemove }: RecurringEntryEditorProps) {
  const [categoria, setCategoria] = useState(DEFAULT_CATEGORIES[tipo][0]);
  const [valor, setValor] = useState<number | ''>('');
  const podeAdicionar = categoria !== OUTROS_CATEGORIA && valor !== '' && valor > 0;

  function handleAdd() {
    if (valor === '' || !podeAdicionar) return;
    onAdd({ id: generateId(), categoria, valor });
    setValor('');
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-3 rounded-xl border border-slate-200 p-3">
        <CategorySelector tipo={tipo} value={categoria} onChange={setCategoria} />
        <div>
          <label className="block text-sm font-medium text-slate-700">Valor</label>
          <div className="mt-1">
            <CurrencyInput value={valor} onChange={setValor} />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!podeAdicionar}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Adicionar
        </button>
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"
            >
              <span>
                {item.categoria} — {formatCurrency(item.valor)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Remover ${item.categoria}`}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
