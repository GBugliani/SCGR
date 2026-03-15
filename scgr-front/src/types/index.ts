export const FinalidadeCategoria = {
    Despesa: 1,
    Receita: 2,
    Ambas: 3
} as const;

export type FinalidadeCategoria = (typeof FinalidadeCategoria)[keyof typeof FinalidadeCategoria];

export const TipoTransacao = {
    Despesa: 1,
    Receita: 2
} as const;

export type TipoTransacao = (typeof TipoTransacao)[keyof typeof TipoTransacao];

export interface IPessoa {
    id: number;
    nome: string;
    idade: number;
}

export interface ICategoria {
    id: number;
    descricao: string;
    finalidade: FinalidadeCategoria;
}

export interface ITransacao {
    id: number;
    descricao: string;
    valor: number;
    tipo: TipoTransacao;
    categoriaId: number;
    pessoaId: number;
    categoria?: ICategoria;
    pessoa?: IPessoa;
}

export interface ITotaisPessoa {
    pessoaId: number;
    nome: string;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
}

export interface ITotaisGerais {
    totalReceitas: number;
    totalDespesas: number;
    saldoLiquido: number;
}

export interface IRelatorioPessoas {
    pessoas: ITotaisPessoa[];
    totalGeral: ITotaisGerais;
}

export interface ITotaisCategoria {
    categoriaId: number;
    descricao: string;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
}

export interface IRelatorioCategorias {
    categorias: ITotaisCategoria[];
    totalGeral: ITotaisGerais;
}