import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../components/guards/auth.guard/auth.guard';
import { AdminGuard } from '../../components/guards/admin.guard/admin.guard.component';

const routes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('../../components/test/create-test/create-test.component').then(m => m.CreateTestComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'list',
    loadComponent: () =>
      import('../../components/test/test-list/test-list.component').then(m => m.TestListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'open',
    loadComponent: () =>
      import('../../components/test/test-open/test-open.component').then(m => m.TestOpenComponent),
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../../components/test/test-detail/test-detail.component').then(m => m.TestDetailComponent),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestsRoutingModule { }
