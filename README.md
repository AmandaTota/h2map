# H2MAP

Aplicação para análise e visualização de dados relacionados a hidrogênio verde.

## Requisitos

- Node.js e npm instalados.

## Como rodar o projeto

```sh
# Instalar dependências
npm i

# Iniciar servidor de desenvolvimento
npm run dev
```

## Estrutura

- `src/` Código-fonte React (componentes, páginas e utilitários)
- `public/` Arquivos estáticos
- `supabase/` Funções e migrações do banco
- `vite.config.ts` Configuração do Vite

## Scripts úteis

- `npm run dev` Inicia o ambiente de desenvolvimento
- `npm run build` Gera build de produção
- `npm run preview` Visualiza o build localmente
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deploy

Você pode implantar o projeto em plataformas como Vercel, Netlify ou qualquer ambiente que suporte aplicações Vite/React.

Passos gerais:

1. Execute `npm run build` para gerar os arquivos de produção.
2. Publique o conteúdo da pasta `dist/` na sua plataforma de hospedagem.
