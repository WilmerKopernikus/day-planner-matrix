import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'calendar/:year/week/:week',
    renderMode: RenderMode.Server,
  },
  {
    path: 'calendar/:year/:month',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
