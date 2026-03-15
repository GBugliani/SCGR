import { FinalidadeCategoria, TipoTransacao } from '../types/index.ts';

export function getFinalidadeCategoriaLabel(finalidade: FinalidadeCategoria): string {
  switch (finalidade) {
    case FinalidadeCategoria.Despesa:
      return 'Despesa';
    case FinalidadeCategoria.Receita:
      return 'Receita';
    case FinalidadeCategoria.Ambas:
      return 'Ambas';
    default:
      return 'Desconhecido';
  }
}

export function getTipoTransacaoLabel(tipo: TipoTransacao): string {
  return tipo === TipoTransacao.Despesa ? 'Despesa' : 'Receita';
}

export function isCategoriaCompativel(tipo: TipoTransacao, finalidade: FinalidadeCategoria): boolean {
  if (tipo === TipoTransacao.Despesa) {
    return finalidade === FinalidadeCategoria.Despesa || finalidade === FinalidadeCategoria.Ambas;
  }

  return finalidade === FinalidadeCategoria.Receita || finalidade === FinalidadeCategoria.Ambas;
}