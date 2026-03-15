import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { pessoasApi } from '../api.ts';
import type { IPessoa } from '../types/index.ts';
import { normalizeSearchValue } from '../utils/format.ts';

export default function Pessoas() {
    const [pessoas, setPessoas] = useState<IPessoa[]>([]);
    const [nome, setNome] = useState('');
    const [idade, setIdade] = useState<number | ''>('');
    const [filtro, setFiltro] = useState('');
    const [pessoaEmEdicao, setPessoaEmEdicao] = useState<IPessoa | null>(null);
    const [pessoaParaExcluir, setPessoaParaExcluir] = useState<IPessoa | null>(null);
    const [editNome, setEditNome] = useState('');
    const [editIdade, setEditIdade] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function carregarPessoas() {
        try {
            setPessoas(await pessoasApi.list());
        } catch (error) {
            console.error("Falha ao buscar pessoas:", error);
        }
    }

    useEffect(() => {
        void carregarPessoas();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await pessoasApi.create({ nome, idade: Number(idade) });
            setNome('');
            setIdade('');
            await carregarPessoas();
        } catch (error) {
            console.error("Falha na persistência da pessoa:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!pessoaParaExcluir) {
            return;
        }

        try {
            setIsDeleting(true);
            await pessoasApi.remove(pessoaParaExcluir.id);
            setPessoaParaExcluir(null);
            await carregarPessoas();
        } catch (error) {
            console.error("Falha ao deletar pessoa:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const abrirEdicao = (pessoa: IPessoa) => {
        setPessoaEmEdicao(pessoa);
        setEditNome(pessoa.nome);
        setEditIdade(pessoa.idade);
    };

    const fecharEdicao = () => {
        setPessoaEmEdicao(null);
        setEditNome('');
        setEditIdade('');
    };

    const abrirConfirmacaoExclusao = (pessoa: IPessoa) => {
        setPessoaParaExcluir(pessoa);
    };

    const fecharConfirmacaoExclusao = () => {
        setPessoaParaExcluir(null);
    };

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!pessoaEmEdicao) {
            return;
        }

        try {
            setIsUpdating(true);
            await pessoasApi.update({
                id: pessoaEmEdicao.id,
                nome: editNome,
                idade: Number(editIdade),
            });
            fecharEdicao();
            await carregarPessoas();
        } catch (error) {
            console.error("Falha ao atualizar pessoa:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const pessoasFiltradas = pessoas.filter((pessoa) => {
        const filtroNormalizado = normalizeSearchValue(filtro);

        if (!filtroNormalizado) {
            return true;
        }

        const nomePessoa = normalizeSearchValue(pessoa.nome);
        const idadePessoa = pessoa.idade.toString();

        return (
            nomePessoa.includes(filtroNormalizado) ||
            idadePessoa.includes(filtroNormalizado)
        );
    });

    return (
        <div>
            <h2 className="section-title">Gestao de Pessoas</h2>
            
            <form className="entity-form" onSubmit={handleSubmit}>
                <div className="form-grid pessoas-form-grid">
                <div className="field">
                    <label>Nome</label>
                    <input 
                        type="text" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        maxLength={200}
                        disabled={isSubmitting}
                        required 
                    />
                </div>
                <div className="field">
                    <label>Idade</label>
                    <input 
                        type="number" 
                        value={idade} 
                        onChange={(e) => setIdade(e.target.value === '' ? '' : Number(e.target.value))} 
                        disabled={isSubmitting}
                        required 
                    />
                </div>
                </div>
                <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Cadastrar pessoa'}
                    </button>
                </div>
            </form>

            <div className="field filter-field">
                <label>Filtrar por nome ou idade</label>
                <input
                    type="text"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="Digite para buscar..."
                />
            </div>

            <div className="table-wrap people-table-wrap">
            <table className="data-table people-table responsive-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Idade</th>
                    </tr>
                </thead>
                <tbody>
                    {pessoasFiltradas.map((p) => (
                        <tr key={p.id} className="data-row-with-actions">
                            <td data-label="ID">{p.id}</td>
                            <td data-label="Nome">{p.nome}</td>
                            <td className="table-actions-anchor" data-label="Idade">
                                <span className="table-primary-value">{p.idade}</span>
                                <div className="row-icon-actions">
                                    <button
                                        className="icon-button"
                                        type="button"
                                        onClick={() => abrirEdicao(p)}
                                        disabled={isUpdating || isDeleting}
                                        aria-label={`Editar ${p.nome}`}
                                        title="Editar"
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M4 20h4.75L19 9.75 14.25 5 4 15.25V20Z" />
                                            <path d="M13.5 5.75 18.25 10.5" />
                                        </svg>
                                    </button>
                                    <button
                                        className="icon-button danger"
                                        type="button"
                                        onClick={() => abrirConfirmacaoExclusao(p)}
                                        disabled={isUpdating || isDeleting}
                                        aria-label={`Excluir ${p.nome}`}
                                        title="Excluir"
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M5 7h14" />
                                            <path d="M9 7V5h6v2" />
                                            <path d="M8 7v12h8V7" />
                                            <path d="M10 11v5" />
                                            <path d="M14 11v5" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            {pessoaEmEdicao ? (
                <div className="modal-backdrop" role="presentation" onClick={fecharEdicao}>
                    <div
                        className="modal-card"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="editar-pessoa-titulo"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>
                                <p className="modal-eyebrow">Cadastro</p>
                                <h3 id="editar-pessoa-titulo">Editar pessoa</h3>
                            </div>
                            <button className="icon-button modal-close-button" type="button" onClick={fecharEdicao} aria-label="Fechar edicao">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M6 6l12 12" />
                                    <path d="M18 6 6 18" />
                                </svg>
                            </button>
                        </div>

                        <form className="stack" onSubmit={handleEditSubmit}>
                            <div className="field">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={editNome}
                                    onChange={(e) => setEditNome(e.target.value)}
                                    maxLength={200}
                                    disabled={isUpdating}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Idade</label>
                                <input
                                    type="number"
                                    value={editIdade}
                                    onChange={(e) => setEditIdade(e.target.value === '' ? '' : Number(e.target.value))}
                                    disabled={isUpdating}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="button-secondary" type="button" onClick={fecharEdicao} disabled={isUpdating}>Cancelar</button>
                                <button className="submit-button" type="submit" disabled={isUpdating}>
                                    {isUpdating ? 'Salvando...' : 'Salvar alteracoes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}

            {pessoaParaExcluir ? (
                <div className="modal-backdrop" role="presentation" onClick={fecharConfirmacaoExclusao}>
                    <div
                        className="modal-card modal-card-compact"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirmar-exclusao-pessoa-titulo"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header modal-header-compact">
                            <div>
                                <p className="modal-eyebrow">Confirmacao</p>
                                <h3 id="confirmar-exclusao-pessoa-titulo">Excluir pessoa?</h3>
                            </div>
                        </div>

                        <p className="modal-copy">
                            Voce vai excluir <strong>{pessoaParaExcluir.nome}</strong> e as transacoes associadas a esse cadastro.
                        </p>

                        <div className="modal-actions">
                            <button className="button-secondary" type="button" onClick={fecharConfirmacaoExclusao} disabled={isDeleting}>Cancelar</button>
                            <button className="danger" type="button" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Confirmar exclusao'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}