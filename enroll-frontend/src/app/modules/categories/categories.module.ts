import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../components/guards/auth.guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../components/category/list-component/category-list.component')
        .then(m => m.CategoryListComponent),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesModule { }
