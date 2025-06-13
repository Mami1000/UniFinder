import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../components/guards/auth.guard/auth.guard';
import { AdminGuard } from '../../components/guards/admin.guard/admin.guard.component';

const routes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('../../components/university/create/create-university.component')
        .then(m => m.UniversityCreateComponent),
        canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: '',
    loadComponent: () =>
      import('../../components/university/list/university-list.component')
        .then(m => m.UniversityListComponent),
        canActivate: [AuthGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../../components/university/detail/university-detail.component')
        .then(m => m.UniversityDetailComponent),
        
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UniversitiesRoutingModule { }
