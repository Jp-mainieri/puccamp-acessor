// Modelo de domínio do BolsoU.
//
// Os nomes das interfaces e campos abaixo são mantidos em português de propósito:
// eles representam o vocabulário financeiro do produto (renda, gasto, investimento).
// O restante do código (componentes, funções, arquivos) é escrito em inglês.

export interface RendaRecorrente {
  id: string;
  categoria: string;
  valor: number;
}

export interface GastoRecorrente {
  id: string;
  categoria: string;
  valor: number;
}

export interface Usuario {
  nome: string;
  saldoInicial: number;
  rendasRecorrentes: RendaRecorrente[];
  gastosRecorrentes: GastoRecorrente[];
  percentualInvestimento: number; // 0-100
  tetoGastos: number | null;
  criadoEm: string;
}

export type TipoLancamento = 'renda' | 'gasto' | 'investimento';

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  categoria: string;
  valor: number;
  data: string; // ISO datetime
  criadoEm: string;
  atualizadoEm: string;
}

export interface CategoriasCustomizadas {
  renda: string[];
  gasto: string[];
  investimento: string[];
}

/** Campos que o chamador fornece ao criar/editar um lançamento; o resto é gerado pelo contexto. */
export type NovoLancamentoInput = Omit<Lancamento, 'id' | 'criadoEm' | 'atualizadoEm'>;
