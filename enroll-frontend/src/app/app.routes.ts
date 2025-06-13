import { Routes } from '@angular/router';
import { NoAuthGuard } from './components/guards/noauth.guard/no-auth.guard'; 
export const routes: Routes = [
  { path: '', redirectTo: 'categories', pathMatch: 'full' },

  { path: '', redirectTo: 'categories', pathMatch: 'full' },
  
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./components/forgot-psasswrod/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) 
  },

  { 
    path: 'categories',
    loadChildren: () => import('./modules/categories/categories.module').then(m => m.CategoriesModule)
  },

  {
    path: 'category',
    loadChildren: () => import('./modules/categories/category.module').then(m => m.CategoryModule)
  },
  { 
    path: 'test',
    loadChildren: () => import('./modules/tests/test.module').then(m => m.TestsModule)
  },
  { 
    path: 'universities',
    loadChildren: () => import('./modules/university/universities.module').then(m => m.UniversitiesModule)
  },
  {
    path: 'profession',
    loadChildren: () =>
      import('./modules/profession/professions.module').then(m => m.ProfessionsModule)
  },
 
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
