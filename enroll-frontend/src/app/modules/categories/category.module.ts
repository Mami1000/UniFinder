import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../components/guards/auth.guard/auth.guard';
import { AdminGuard } from '../../components/guards/admin.guard/admin.guard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
const routes: Routes = [
  // Создание новой категории по адресу `/category/create`
  { 
    path: 'create', 
    loadComponent: () =>
      import('../../components/category/create-component/category-create.component')
        .then(m => m.CategoryCreateComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  // Вывод вопросов по конкретной категории по адресу `/category/:categoryId/questions`
  { 
    path: ':categoryId/questions', 
    loadComponent: () =>
      import('../../components/category/question.component/category-questions.component')
        .then(m => m.CategoryQuestionsComponent),
    canActivate: [AuthGuard]
  },
  // Создание вопроса в категории по адресу `/category/:categoryId/question/create`
  { 
    path: ':categoryId/question/create', 
    loadComponent: () =>
      import('../../components/question/question-create/question-create.component')
        .then(m => m.QuestionCreateComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: ':id/question/bulk-create',
    loadComponent: () =>
      import('../../components/question/question-create/bulk-question/bulk-question-create.component')
        .then(m => m.BulkQuestionCreateComponent),
    canActivate: [AuthGuard, AdminGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryModule { }
