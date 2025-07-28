import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./upload/upload.component').then((m) => m.UploadComponent),
      },
      {
        path: 'watch/:fileId',
        loadComponent: () =>
          import('./watch/watch.component').then((m) => m.WatchComponent),
      },
    ],
  },
];
