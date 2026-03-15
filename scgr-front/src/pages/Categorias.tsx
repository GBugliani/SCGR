import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { categoriasApi } from '../api.ts';
import type { ICategoria } from '../types/index.ts';
import { FinalidadeCategoria } from '../types/index.ts';
import * as domainUtils from '../utils/domain.ts';
import { normalizeSearchValue } from '../utils/format.ts';

export default function Categorias() {
    const [categorias, setCategorias] = useState<ICategoria[]>([]);
    const [descricao, setDescricao] = useState('');
    const [finalidade, setFinalidade] = useState<FinalidadeCategoria>(FinalidadeCategoria.Despesa);
    const [filtro, setFiltro] = useState('');

    async function carregarCategorias() {
        try {
            setCategorias(await categoriasApi.list());
        } catch (error) {
            console.error("Falha ao buscar categorias:", error);
        }
    }

    useEffect(() => {
        void carregarCategorias();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await categoriasApi.create({
                descricao, 
                finalidade: Number(finalidade) 
            });

            setDescricao('');
            setFinalidade(FinalidadeCategoria.Despesa);
            await carregarCategorias();
        } catch (error) {
            console.error("Falha na persistência da categoria:", error);
        }
    };

    const categoriasFiltradas = categorias.filter((c) => {
        const filtroNormalizado = normalizeSearchValue(filtro);

        if (!filtroNormalizado) {
            return true;
        }

        const descricaoCategoria = normalizeSearchValue(c.descricao);
        const finalidadeCategoria = normalizeSearchValue(domainUtils.getFinalidadeCategoriaLabel(c.finalidade));

        return (
            descricaoCategoria.includes(filtroNormalizado) ||
            finalidadeCategoria.includes(filtroNormalizado)
        );
    });

    return (
        <div>
            <h2 className="section-title">Gestao de Categorias</h2>
            
            <form className="entity-form" onSubmit={handleSubmit}>
                <div className="form-grid categorias-form-grid">
                <div className="field">
                    <label>Descricao</label>
                    <input 
                        type="text" 
                        value={descricao} 
                        onChange={(e) => setDescricao(e.target.value)} 
                        maxLength={400}
                        required
                    />
                </div>
                <div className="field">
                    <label>Finalidade</label>
                    <select 
                        value={finalidade} 
                        onChange={(e) => setFinalidade(Number(e.target.value) as FinalidadeCategoria)}
                    >
                        <option value={FinalidadeCategoria.Despesa}>Despesa</option>
                        <option value={FinalidadeCategoria.Receita}>Receita</option>
                        <option value={FinalidadeCategoria.Ambas}>Ambas</option>
                    </select>
                </div>
                </div>
                <div className="form-actions">
                    <button className="submit-button" type="submit">Cadastrar categoria</button>
                </div>
            </form>

            <div className="field filter-field">
                <label>Filtrar por descricao ou finalidade</label>
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
                        <th>Descricao</th>
                        <th>Finalidade</th>
                    </tr>
                </thead>
                <tbody>
                    {categoriasFiltradas.map((c) => (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.descricao}</td>
                            <td>{domainUtils.getFinalidadeCategoriaLabel(c.finalidade)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}