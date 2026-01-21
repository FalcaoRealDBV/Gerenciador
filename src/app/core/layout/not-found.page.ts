import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ZardButtonComponent } from '@/shared/components/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ZardButtonComponent],
  template: `
    <section class="flex flex-col items-start gap-4">
      <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Nao encontrado</p>
      <h2 class="text-3xl font-semibold">Pagina nao localizada</h2>
      <p class="text-muted-foreground">Essa rota nao existe ou nao esta disponivel para o seu perfil.</p>
      <a z-button routerLink="/">Voltar ao painel</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPageComponent {}
