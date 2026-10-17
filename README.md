# DEVThiago — Frontend

Sistema de gestão (Dashboard, Projetos, Calendário, Clientes, Financeiro, Suporte). React + TypeScript + Vite + Tailwind + shadcn/ui.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Confirme o `.env` (já criado) apontando para a API:

   ```
   VITE_API_URL="http://localhost:4000"
   ```

3. Suba a API (repositório irmão `Dev-Flow-api`) antes de iniciar o frontend.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse http://localhost:5173.

## Login de teste

- E-mail: `thiago@devthiago.com`
- Senha: `password123`

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — type-check + build de produção
- `npm run preview` — preview do build de produção

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (base-ui)
- TanStack Query + axios
- react-hook-form + zod
- recharts
- react-router-dom
