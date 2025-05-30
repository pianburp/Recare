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
  },  {
    path: 'profile',
    loadComponent: () => import('./admin/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'home',
    loadComponent: () => import('./elderly/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'home',
    loadComponent: () => import('./caregiver/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'review',
    loadComponent: () => import('./elderly/review/review.page').then( m => m.ReviewPage)
  }

];
