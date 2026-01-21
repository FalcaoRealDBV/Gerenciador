import { Routes } from '@angular/router';

import { ShellComponent } from '@/core/layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPageComponent)
      },
      {
        path: 'ranking',
        loadChildren: () => import('./features/ranking/ranking.routes').then(m => m.rankingRoutes)
      },
      {
        path: 'simulacao',
        loadComponent: () => import('./features/simulation/simulation.page').then(m => m.SimulationPageComponent)
      },
      {
        path: '**',
        loadComponent: () => import('./core/layout/not-found.page').then(m => m.NotFoundPageComponent)
      }
    ]
  }
];
