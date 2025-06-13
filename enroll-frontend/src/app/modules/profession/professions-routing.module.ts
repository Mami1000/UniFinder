import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from '../../components/guards/auth.guard/auth.guard';
import { AdminGuard } from '../../components/guards/admin.guard/admin.guard.component';

const routes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('../../components/profession/profession-create/profession-create.component')
        .then(m => m.ProfessionCreateComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
    {
    path: 'bulk-upload',
    loadComponent: () =>
      import('../../components/profession/profession-create/bulk-profession/bulk-profession-upload.component')
        .then(m => m.BulkProfessionUploadComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'list',
    loadComponent: () =>
      import('../../components/profession/profession-list/profession-list.component')
        .then(m => m.ProfessionListComponent),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfessionsRoutingModule {}
