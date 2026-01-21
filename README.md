# Central Desbravador

Aplicativo Angular 20 com PWA para gerenciamento do ranking do clube de Desbravadores.

## Como rodar

```bash
npm install
npm start
```

Abra `http://localhost:4200`.

## PWA (instalavel)

```bash
npm run build
```

Sirva o conteudo da pasta `dist/central-desbravador` em um servidor estatico com HTTPS para testar instalacao offline.

## ZardUI + Tailwind

Esta base ja inclui:

- `components.json` com os aliases do ZardUI
- `.postcssrc.json` configurado para Tailwind CSS v4
- `src/styles.css` com o tema ZardUI (base neutral)
- Componentes ZardUI em `src/app/shared/components`

Para adicionar novos componentes:

```bash
npx @ngzard/ui@latest add button card dialog
```

## Modo de simulacao

- Use o menu no topo (avatar) para trocar perfil e unidade.
- A rota `/simulacao` permite ajustar o perfil com mais contexto.
- Mudancas sao refletidas imediatamente em rotas, acoes e permissões.

## Trocar mock por API no futuro

Os repositorios seguem a mesma assinatura de uma API real (Observables e metodos CRUD):

- `src/app/features/ranking/services/activity.repository.ts`
- `src/app/features/ranking/services/submission.repository.ts`
- `src/app/features/ranking/services/ranking.repository.ts`

Para migrar:

1. Crie implementacoes novas usando `HttpClient` dentro desses repositorios.
2. Preserve as assinaturas publicas (`list/get/create/update/patch/delete`).
3. Remova o uso de `MockDbService` e `MockHttpService` nas implementacoes.

Os mocks atuais persistem dados em `LocalStorage` e imagens em `IndexedDB`.

## Estrutura principal

```
src/app/core        -> guards, layout, utilitarios e types
src/app/data        -> mock db, seed e persistencia local
src/app/features    -> ranking e paginas
src/app/shared/ui   -> componentes de UI reutilizaveis
```
