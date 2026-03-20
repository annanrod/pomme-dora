# Pomme & Dora Grove

Aplicativo de pomodoro em React + Vite com foco em uma experiencia visual leve e progresso local do usuario.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`

## Estrutura

- `src/pages/Index.tsx`: tela principal
- `src/hooks/usePomodoro.ts`: regra de negocio do timer
- `src/components/`: UI da aplicacao
- `src/test/` e `src/**/*.test.tsx`: testes

## Comportamento

- configuracoes e estatisticas sao persistidas em `localStorage`
- tema claro/escuro usa `next-themes`
- sessoes de foco alimentam streak, conquistas e nivel da arvore
