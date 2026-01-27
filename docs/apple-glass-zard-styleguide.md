# Apple Glass + Zard UI Styleguide

## Tokens principais (OKLCH)
- `--background`, `--foreground`
- `--surface-solid`
- `--glass-bg`, `--glass-bg-strong`
- `--glass-border`, `--glass-shadow`
- `--glass-blur`, `--glass-strong-blur`, `--glass-saturate`
- `--ring`, `--border`, `--input`

## Utilitarios de superficie
- `.glass`: headers, toolbars, filtros e paineis pequenos
- `.glass-strong`: modais, popovers, dropdowns e alertas
- `.glass-card`: cards em destaque (padding automatico; em `z-card` o padding e do proprio componente)
- `.surface-solid`: tabelas, formularios longos e areas com muito texto

## Exemplos rapidos

### Header
```html
<header class="glass rounded-none border-x-0 border-t-0">
  <div class="mx-auto max-w-6xl px-4 py-3">...</div>
</header>
```

### Card
```html
<z-card class="glass-card" zTitle="Resumo" zDescription="Status geral">
  <div class="flex items-center justify-between">...</div>
</z-card>
```

### Modal (dialog)
```ts
this.dialog.create({
  zTitle: 'Confirmar acao',
  zContent: ConfirmDialogComponent,
  zCustomClasses: 'glass-strong'
});
```

## Nao faca
- Nao use glass em tabelas densas ou listas muito longas.
- Nao aplique blur em areas enormes (limite 1-2 superfices grandes por tela).
- Nao reduza contraste abaixo do necessario para leitura; use `.surface-solid` quando houver duvida.
