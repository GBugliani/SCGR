import { useEffect, useState } from 'react';
import { relatoriosApi } from '../api.ts';
import type { IRelatorioCategorias, IRelatorioPessoas, ITotaisGerais } from '../types/index.ts';
import { formatCurrency } from '../utils/format.ts';

interface RelatorioLinha {
    id: number;
    nome: string;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
}

interface RelatorioSecaoProps {
    titulo: string;
    cabecalhoPrincipal: string;
    linhas: RelatorioLinha[];
    totalGeral?: ITotaisGerais;
}

function RelatorioSecao({ titulo, cabecalhoPrincipal, linhas, totalGeral }: RelatorioSecaoProps) {
    return (
        <section>
            <h3>{titulo}</h3>
            <div className="table-wrap">
                <table className="data-table responsive-table responsive-table-with-footer">
                    <thead>
                        <tr>
                            <th>{cabecalhoPrincipal}</th>
                            <th>Total de Receitas</th>
                            <th>Total de Despesas</th>
                            <th>Saldo Líquido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.map((linha) => (
                            <tr key={linha.id}>
                                <td data-label={cabecalhoPrincipal}>{linha.nome}</td>
                                <td data-label="Total de Receitas" className="money-positive">{formatCurrency(linha.totalReceitas)}</td>
                                <td data-label="Total de Despesas" className="money-negative">{formatCurrency(linha.totalDespesas)}</td>
                                <td data-label="Saldo Liquido" className={linha.saldo >= 0 ? 'money-positive' : 'money-negative'}>
                                    {formatCurrency(linha.saldo)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {totalGeral && (
                            <tr className="summary-row">
                                <td data-label={cabecalhoPrincipal}>TOTAL GERAL</td>
                                <td data-label="Total de Receitas" className="money-positive">{formatCurrency(totalGeral.totalReceitas)}</td>
                                <td data-label="Total de Despesas" className="money-negative">{formatCurrency(totalGeral.totalDespesas)}</td>
                                <td data-label="Saldo Liquido" className={totalGeral.saldoLiquido >= 0 ? 'money-positive' : 'money-negative'}>
                                    {formatCurrency(totalGeral.saldoLiquido)}
                                </td>
                            </tr>
                        )}
                    </tfoot>
                </table>
            </div>
        </section>
    );
}

export default function Relatorios() {
    const [relatorioPessoas, setRelatorioPessoas] = useState<IRelatorioPessoas | null>(null);
    const [relatorioCategorias, setRelatorioCategorias] = useState<IRelatorioCategorias | null>(null);

    async function carregarRelatorios() {
        try {
            const [pessoas, categorias] = await Promise.all([
                relatoriosApi.pessoas(),
                relatoriosApi.categorias(),
            ]);

            setRelatorioPessoas(pessoas);
            setRelatorioCategorias(categorias);
        } catch (error) {
            console.error("Falha ao buscar dados de totalização:", error);
        }
    }

    useEffect(() => {
        void carregarRelatorios();
    }, []);

    const linhasPessoas: RelatorioLinha[] = relatorioPessoas?.pessoas.map((pessoa) => ({
        id: pessoa.pessoaId,
        nome: pessoa.nome,
        totalReceitas: pessoa.totalReceitas,
        totalDespesas: pessoa.totalDespesas,
        saldo: pessoa.saldo,
    })) ?? [];

    const linhasCategorias: RelatorioLinha[] = relatorioCategorias?.categorias.map((categoria) => ({
        id: categoria.categoriaId,
        nome: categoria.descricao,
        totalReceitas: categoria.totalReceitas,
        totalDespesas: categoria.totalDespesas,
        saldo: categoria.saldo,
    })) ?? [];

    return (
        <div className="stack">
            <h2 className="section-title">Consulta de Totais</h2>
            <RelatorioSecao
                titulo="Totais por Pessoa"
                cabecalhoPrincipal="Pessoa"
                linhas={linhasPessoas}
                totalGeral={relatorioPessoas?.totalGeral}
            />
            <RelatorioSecao
                titulo="Totais por Categoria"
                cabecalhoPrincipal="Categoria"
                linhas={linhasCategorias}
                totalGeral={relatorioCategorias?.totalGeral}
            />
        </div>
    );
}