import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'elderly',
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./elderly/profile/profile.page').then( m => m.ProfilePage)
      },
      // Add other elderly routes here
    ]
  },
  {
    path: 'caregiver',
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./caregiver/profile/profile.page').then( m => m.ProfilePage)
      }
    ]
  }
];
