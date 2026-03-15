import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { categoriasApi, pessoasApi, transacoesApi } from '../api.ts';
import type { ITransacao, IPessoa, ICategoria } from '../types/index.ts';
import { TipoTransacao } from '../types/index.ts';
import * as domainUtils from '../utils/domain.ts';
import { formatCurrency, normalizeSearchValue } from '../utils/format.ts';


export default function Transacoes() {
    const [transacoes, setTransacoes] = useState<ITransacao[]>([]);
    const [pessoas, setPessoas] = useState<IPessoa[]>([]);
    const [categorias, setCategorias] = useState<ICategoria[]>([]);

    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState<number | ''>('');
    const [tipo, setTipo] = useState<TipoTransacao>(TipoTransacao.Despesa);
    const [categoriaId, setCategoriaId] = useState<number | ''>('');
    const [pessoaId, setPessoaId] = useState<number | ''>('');
    const [filtro, setFiltro] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function carregarDadosBase() {
        try {
            const [listaTransacoes, listaPessoas, listaCategorias] = await Promise.all([
                transacoesApi.list(),
                pessoasApi.list(),
                categoriasApi.list(),
            ]);
            setTransacoes(listaTransacoes);
            setPessoas(listaPessoas);
            setCategorias(listaCategorias);
        } catch (error) {
            console.error("Falha ao buscar dados base:", error);
        }
    }

    useEffect(() => {
        void carregarDadosBase();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await transacoesApi.create({
                descricao,
                valor: Number(valor),
                tipo: Number(tipo),
                categoriaId: Number(categoriaId),
                pessoaId: Number(pessoaId)
            });
            
            setDescricao('');
            setValor('');
            setCategoriaId('');
            setPessoaId('');
            await carregarDadosBase();
        } catch (error) {
            console.error("Falha na persistência da transação:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const pessoaSelecionada = pessoas.find(p => p.id === Number(pessoaId));
    const isMenorDeIdade = pessoaSelecionada ? pessoaSelecionada.idade < 18 : false;

    useEffect(() => {
        if (isMenorDeIdade && tipo !== TipoTransacao.Despesa) {
            setTipo(TipoTransacao.Despesa);
        }
    }, [isMenorDeIdade, tipo]);

    const categoriasFiltradas = categorias.filter((c) => domainUtils.isCategoriaCompativel(tipo, c.finalidade));

    useEffect(() => {
        if (categoriaId !== '' && !categoriasFiltradas.some(c => c.id === Number(categoriaId))) {
            setCategoriaId('');
        }
    }, [categoriasFiltradas, categoriaId]);

    const transacoesFiltradas = transacoes.filter((t) => {
        const filtroNormalizado = normalizeSearchValue(filtro);

        if (!filtroNormalizado) {
            return true;
        }

        const pessoa = normalizeSearchValue(t.pessoa?.nome ?? '');
        const categoria = normalizeSearchValue(t.categoria?.descricao ?? '');
        const tipoTexto = normalizeSearchValue(domainUtils.getTipoTransacaoLabel(t.tipo));
        const descricaoTransacao = normalizeSearchValue(t.descricao);
        const valorTransacao = t.valor.toString();
        const valorFormatado = normalizeSearchValue(formatCurrency(t.valor));

        return (
            pessoa.includes(filtroNormalizado) ||
            categoria.includes(filtroNormalizado) ||
            tipoTexto.includes(filtroNormalizado) ||
            descricaoTransacao.includes(filtroNormalizado) ||
            valorTransacao.includes(filtroNormalizado) ||
            valorFormatado.includes(filtroNormalizado)
        );
    });

    return (
        <div>
            <h2 className="section-title">Gestao de Transacoes</h2>
            
            <form className="entity-form" onSubmit={handleSubmit}>
                <div className="form-grid transaction-form-grid">
                <div className="field">
                    <label>Pessoa</label>
                    <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value === '' ? '' : Number(e.target.value))} disabled={isSubmitting} required>
                        <option value="" disabled>Selecione uma pessoa</option>
                        {pessoas.map(p => (
                            <option key={p.id} value={p.id}>{p.nome} (Idade: {p.idade})</option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Tipo</label>
                    <select 
                        value={tipo} 
                        onChange={(e) => setTipo(Number(e.target.value) as TipoTransacao)}
                        disabled={isMenorDeIdade || isSubmitting}
                    >
                        <option value={TipoTransacao.Despesa}>Despesa</option>
                        <option value={TipoTransacao.Receita}>Receita</option>
                    </select>
                    {isMenorDeIdade && <small className="note">Menores de idade apenas despesas.</small>}
                </div>

                <div className="field">
                    <label>Categoria</label>
                    <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value === '' ? '' : Number(e.target.value))} disabled={isSubmitting} required>
                        <option value="" disabled>Selecione uma categoria</option>
                        {categoriasFiltradas.map(c => (
                            <option key={c.id} value={c.id}>{c.descricao}</option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Descricao</label>
                    <input 
                        type="text" 
                        value={descricao} 
                        onChange={(e) => setDescricao(e.target.value)} 
                        maxLength={400}
                        disabled={isSubmitting}
                        required 
                    />
                </div>

                <div className="field">
                    <label>Valor</label>
                    <input 
                        type="number" 
                        step="0.01"
                        min="0.01"
                        value={valor} 
                        onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))} 
                        disabled={isSubmitting}
                        required 
                    />
                </div>
                </div>
                <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Cadastrar transacao'}
                    </button>
                </div>
            </form>

            <div className="field filter-field">
                <label>Filtrar por pessoa, categoria, tipo, descricao ou valor</label>
                <input
                    type="text"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="Digite para buscar..."
                />
            </div>

            <div className="table-wrap">
            <table className="data-table responsive-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pessoa</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {transacoesFiltradas.map((t) => (
                        <tr key={t.id}>
                            <td data-label="ID">{t.id}</td>
                            <td data-label="Pessoa">{t.pessoa?.nome}</td>
                            <td data-label="Categoria">{t.categoria?.descricao}</td>
                            <td data-label="Tipo">{domainUtils.getTipoTransacaoLabel(t.tipo)}</td>
                            <td data-label="Descricao">{t.descricao}</td>
                            <td data-label="Valor" className={t.tipo === TipoTransacao.Receita ? 'money-positive' : 'money-negative'}>{formatCurrency(t.valor)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}