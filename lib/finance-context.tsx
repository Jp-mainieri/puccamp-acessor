'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  CategoriasCustomizadas,
  Lancamento,
  NovoLancamentoInput,
  TipoLancamento,
  Usuario,
} from '@/types';
import { EMPTY_CATEGORIAS_CUSTOMIZADAS } from '@/lib/constants';
import {
  clearAllBolsouData,
  generateId,
  loadCategoriasCustomizadas,
  loadLancamentos,
  loadUsuario,
  saveCategoriasCustomizadas,
  saveLancamentos,
  saveUsuario,
} from '@/lib/storage';

interface FinanceState {
  usuario: Usuario | null;
  lancamentos: Lancamento[];
  categoriasCustomizadas: CategoriasCustomizadas;
  /** Falso em SSR e no primeiro render do cliente; vira true depois do useEffect de leitura do localStorage. */
  hydrated: boolean;
}

interface FinanceContextValue extends FinanceState {
  setUsuario: (usuario: Usuario) => void;
  updateUsuario: (patch: Partial<Usuario>) => void;
  addLancamento: (input: NovoLancamentoInput) => Lancamento;
  updateLancamento: (id: string, input: NovoLancamentoInput) => void;
  deleteLancamento: (id: string) => void;
  addCategoriaCustomizada: (tipo: TipoLancamento, nome: string) => void;
  resetAllData: () => void;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

// Estado inicial idêntico em servidor e cliente — evita qualquer mismatch de hidratação.
const INITIAL_STATE: FinanceState = {
  usuario: null,
  lancamentos: [],
  categoriasCustomizadas: EMPTY_CATEGORIAS_CUSTOMIZADAS,
  hydrated: false,
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(INITIAL_STATE);

  useEffect(() => {
    setState({
      usuario: loadUsuario(),
      lancamentos: loadLancamentos(),
      categoriasCustomizadas: loadCategoriasCustomizadas(),
      hydrated: true,
    });
  }, []);

  const setUsuario = useCallback((usuario: Usuario) => {
    saveUsuario(usuario);
    setState((prev) => ({ ...prev, usuario }));
  }, []);

  const updateUsuario = useCallback((patch: Partial<Usuario>) => {
    setState((prev) => {
      if (!prev.usuario) return prev;
      const usuario = { ...prev.usuario, ...patch };
      saveUsuario(usuario);
      return { ...prev, usuario };
    });
  }, []);

  const addLancamento = useCallback((input: NovoLancamentoInput): Lancamento => {
    const agora = new Date().toISOString();
    const novo: Lancamento = { ...input, id: generateId(), criadoEm: agora, atualizadoEm: agora };
    setState((prev) => {
      const lancamentos = [...prev.lancamentos, novo];
      saveLancamentos(lancamentos);
      return { ...prev, lancamentos };
    });
    return novo;
  }, []);

  const updateLancamento = useCallback((id: string, input: NovoLancamentoInput) => {
    setState((prev) => {
      const lancamentos = prev.lancamentos.map((lancamento) =>
        lancamento.id === id
          ? { ...lancamento, ...input, atualizadoEm: new Date().toISOString() }
          : lancamento
      );
      saveLancamentos(lancamentos);
      return { ...prev, lancamentos };
    });
  }, []);

  const deleteLancamento = useCallback((id: string) => {
    setState((prev) => {
      const lancamentos = prev.lancamentos.filter((lancamento) => lancamento.id !== id);
      saveLancamentos(lancamentos);
      return { ...prev, lancamentos };
    });
  }, []);

  const addCategoriaCustomizada = useCallback((tipo: TipoLancamento, nome: string) => {
    const nomeAparado = nome.trim();
    if (!nomeAparado) return;
    setState((prev) => {
      const jaExiste = prev.categoriasCustomizadas[tipo].some(
        (categoria) => categoria.toLocaleLowerCase('pt-BR') === nomeAparado.toLocaleLowerCase('pt-BR')
      );
      if (jaExiste) return prev;
      const categoriasCustomizadas: CategoriasCustomizadas = {
        ...prev.categoriasCustomizadas,
        [tipo]: [...prev.categoriasCustomizadas[tipo], nomeAparado],
      };
      saveCategoriasCustomizadas(categoriasCustomizadas);
      return { ...prev, categoriasCustomizadas };
    });
  }, []);

  // Limpa o storage e o estado em memória. Não navega — quem chama decide o redirecionamento.
  const resetAllData = useCallback(() => {
    clearAllBolsouData();
    setState({ ...INITIAL_STATE, hydrated: true });
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      ...state,
      setUsuario,
      updateUsuario,
      addLancamento,
      updateLancamento,
      deleteLancamento,
      addCategoriaCustomizada,
      resetAllData,
    }),
    [
      state,
      setUsuario,
      updateUsuario,
      addLancamento,
      updateLancamento,
      deleteLancamento,
      addCategoriaCustomizada,
      resetAllData,
    ]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance precisa ser usado dentro de um <FinanceProvider>.');
  }
  return context;
}
