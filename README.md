# SCGR - Sistema de Controle de Gastos Residenciais

Uma aplicação full stack para controle financeiro residencial, com cadastro de pessoas, categorias, transações e relatórios consolidados.

## Visão Geral

O projeto é dividido em duas aplicações:

- Backend em ASP.NET Core com Entity Framework Core e SQLite
- Frontend em React + TypeScript + Vite

Funcionalidades principais:

- Cadastro de pessoas
- Cadastro de categorias (Despesa, Receita ou Ambas)
- Cadastro e listagem de transações
- Relatórios de totais por pessoa
- Relatórios de totais por categoria
- Total geral com receitas, despesas e saldo líquido

## Tecnologias

- .NET 10 (backend)
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- React 19
- TypeScript
- Vite
- Axios
- React Router

## Pré-requisitos

Instale na sua máquina:

- .NET SDK 10
- Node.js 20 ou superior
- npm

Opcional para comandos de migration:

- dotnet-ef como ferramenta global

    dotnet tool install --global dotnet-ef

Se já tiver instalado:

    dotnet tool update --global dotnet-ef

## Estrutura do Projeto

- scgr-back: aplicação backend
- scgr-front: aplicação frontend

## Como Rodar o Projeto

## 1. Subir o Backend

Abra um terminal na pasta do backend e restaure os pacotes:

    cd scgr-back/SCGR
    dotnet restore

Aplique as migrations (recomendado para garantir banco atualizado):

    dotnet ef database update

Rode a API:

    dotnet run

A API sobe, por padrão, em:

- http://localhost:5127
- https://localhost:7175

Base da API usada pelo frontend:

- http://localhost:5127/api

## 2. Subir o Frontend

Em outro terminal, vá para o frontend:

    cd scgr-front
    npm install

Rode em modo desenvolvimento:

    npm run dev

O frontend abre, por padrão, em:

- http://localhost:5173

## Configuração de Ambiente (Frontend)

O frontend usa esta lógica para a URL da API:

- Se VITE_API_BASE_URL existir, usa essa variável
- Caso contrário, usa http://localhost:5127/api

Se quiser apontar para outro backend, crie um arquivo .env na raiz de scgr-front com:

    VITE_API_BASE_URL=http://localhost:5127/api

## Regras de Negócio Implementadas

As principais validações no backend:

- Menores de 18 anos só podem registrar transações do tipo Despesa
- Categoria deve ser compatível com o tipo da transação:
- Transação Despesa aceita categoria Despesa ou Ambas
- Transação Receita aceita categoria Receita ou Ambas
- Não é permitido apagar categoria que já esteja em uso por transações
- Ao excluir pessoa, as transações dela são excluídas em cascata
- Valor da transação deve ser maior que zero

## Endpoints Principais

Pessoas:

- GET /api/pessoas
- POST /api/pessoas
- PUT /api/pessoas/{id}
- DELETE /api/pessoas/{id}
- GET /api/pessoas/totais

Categorias:

- GET /api/categorias
- POST /api/categorias
- GET /api/categorias/totais

Transações:

- GET /api/transacoes
- POST /api/transacoes

## Enums Usados no Domínio

Finalidade da categoria:

- 1 = Despesa
- 2 = Receita
- 3 = Ambas

Tipo da transação:

- 1 = Despesa
- 2 = Receita

## Scripts Úteis

Backend:

    dotnet build
    dotnet run

Frontend:

    npm run dev
    npm run build
    npm run lint
    npm run preview

## Fluxo Recomendado de Uso

1. Cadastrar pessoas
2. Cadastrar categorias
3. Cadastrar transações
4. Consultar a tela de relatórios para ver totais por pessoa e categoria
