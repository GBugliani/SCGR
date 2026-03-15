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
        try {
            await pessoasApi.create({ nome, idade: Number(idade) });
            setNome('');
            setIdade('');
            await carregarPessoas();
        } catch (error) {
            console.error("Falha na persistência da pessoa:", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await pessoasApi.remove(id);
            await carregarPessoas();
        } catch (error) {
            console.error("Falha ao deletar pessoa:", error);
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
                        required 
                    />
                </div>
                <div className="field">
                    <label>Idade</label>
                    <input 
                        type="number" 
                        value={idade} 
                        onChange={(e) => setIdade(e.target.value === '' ? '' : Number(e.target.value))} 
                        required 
                    />
                </div>
                </div>
                <div className="form-actions">
                    <button className="submit-button" type="submit">Cadastrar pessoa</button>
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

            <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Idade</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {pessoasFiltradas.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nome}</td>
                            <td>{p.idade}</td>
                            <td>
                                <button className="danger table-action-button" type="button" onClick={() => handleDelete(p.id)}>Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}