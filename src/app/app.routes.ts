import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
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
      {
        path: 'home',
        loadComponent: () => import('./elderly/home/home.page').then( m => m.HomePage)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./elderly/notifications/notifications.page').then( m => m.NotificationsPage)
      },
      {
        path: 'reward',
        loadComponent: () => import('./elderly/reward/reward.page').then( m => m.RewardPage)
      },
      {
        path: 'book-care',
        loadComponent: () => import('./elderly/book-care/book-care.page').then( m => m.BookCarePage)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./elderly/schedule/schedule.page').then( m => m.SchedulePage)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./elderly/kyc/kyc.page').then( m => m.KycPage)
      },
      {
        path: 'payment',
        loadComponent: () => import('./elderly/payment/payment.page').then( m => m.PaymentPage)
      },

    ]
  },
  {
    path: 'caregiver',
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./caregiver/profile/profile.page').then( m => m.ProfilePage)
      },
      {
        path: 'home',
        loadComponent: () => import('./caregiver/home/home.page').then( m => m.HomePage)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./caregiver/kyc/kyc.page').then( m => m.KycPage)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./caregiver/analytics/analytics.page').then( m => m.AnalyticsPage)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./caregiver/notifications/notifications.page').then( m => m.NotificationsPage)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./caregiver/schedule/schedule.page').then( m => m.SchedulePage)
      },
    ]
  },
  {
    path: 'admin',
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./admin/profile/profile.page').then( m => m.ProfilePage)
      },
      {
        path: 'home',
        loadComponent: () => import('./admin/home/home.page').then( m => m.HomePage)
      }
    ]
  },
  


];
