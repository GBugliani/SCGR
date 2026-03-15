import axios from 'axios';
import type {
    ICategoria,
    IPessoa,
    IRelatorioCategorias,
    IRelatorioPessoas,
    ITransacao,
} from './types/index.ts';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5127/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Falha na comunicação de rede ou validação de domínio:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const pessoasApi = {
    list: async () => (await api.get<IPessoa[]>('/pessoas')).data,
    create: async (payload: { nome: string; idade: number }) => {
        await api.post('/pessoas', payload);
    },
    remove: async (id: number) => {
        await api.delete(`/pessoas/${id}`);
    },
};

export const categoriasApi = {
    list: async () => (await api.get<ICategoria[]>('/categorias')).data,
    create: async (payload: { descricao: string; finalidade: number }) => {
        await api.post('/categorias', payload);
    },
};

export const transacoesApi = {
    list: async () => (await api.get<ITransacao[]>('/transacoes')).data,
    create: async (payload: {
        descricao: string;
        valor: number;
        tipo: number;
        categoriaId: number;
        pessoaId: number;
    }) => {
        await api.post('/transacoes', payload);
    },
};

export const relatoriosApi = {
    pessoas: async () => (await api.get<IRelatorioPessoas>('/pessoas/totais')).data,
    categorias: async () => (await api.get<IRelatorioCategorias>('/categorias/totais')).data,
};

export default api;