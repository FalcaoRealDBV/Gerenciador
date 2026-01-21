import { Routes } from '@angular/router';

import { roleGuard } from '@/core/guards/role.guard';

export const rankingRoutes: Routes = [
  {
    path: 'atividades',
    loadComponent: () => import('./pages/activities.page').then(m => m.ActivitiesPageComponent)
  },
  {
    path: 'atividades/nova',
    loadComponent: () => import('./pages/activity-form.page').then(m => m.ActivityFormPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['DIRETORIA'] }
  },
  {
    path: 'atividades/:id/editar',
    loadComponent: () => import('./pages/activity-form.page').then(m => m.ActivityFormPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['DIRETORIA'] }
  },
  {
    path: 'atividades/:id',
    loadComponent: () => import('./pages/activity-detail.page').then(m => m.ActivityDetailPageComponent)
  },
  {
    path: 'avaliacoes',
    loadComponent: () => import('./pages/pending-reviews.page').then(m => m.PendingReviewsPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['DIRETORIA'] }
  },
  {
    path: 'ranking',
    loadComponent: () => import('./pages/ranking-board.page').then(m => m.RankingBoardPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['DIRETORIA'] }
  }
];
