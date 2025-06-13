import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TestService, Test } from '../../../services/test/test.service';
import { CategoryService, Category } from '../../../services/category/category.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth/auth.service/auth.service';
import { LoaderService } from '../../../services/loader/loader.service';
import { Observable } from 'rxjs';
import { PaginationComponent } from '../../paginatoion/pagination.component'; 
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSnackBarModule,
    PaginationComponent
  ],
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.css']
})
export class TestListComponent implements OnInit {
  tests: Test[] = [];
  pagedTests: Test[] = [];
  error: string | null = null;
  categoriesMap: { [id: string]: string } = {};
  isAdmin: boolean = false;

  isLoading$!: Observable<boolean>; // правильное определение

  // Пагинация
  pageSize = 6;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private testService: TestService,
    private router: Router,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private loaderService: LoaderService,
    private searchSubject: Subject<string> = new Subject<string>()
    
  ) {}

  ngOnInit(): void {
  this.isLoading$ = this.loaderService.isLoading$;

  const role = this.authService.getUserRole();
  this.isAdmin = role?.toLowerCase() === 'admin';

  // оптимизированная подписка
  this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(searchTerm => {
      if (!searchTerm) return this.testService.getTests();
      return this.testService.searchTests(searchTerm);
    })
  ).subscribe({
    next: (data: Test[]) => {
      this.tests = data;
      this.totalPages = Math.ceil(this.tests.length / this.pageSize);
      this.currentPage = 1;
      this.updatePagedTests();
    },
    error: (err) => {
      this.error = err.error?.message || 'Ошибка поиска тестов';
    }
  });

  // Подписка на queryParams -> передаём в subject
  this.route.queryParams.pipe(
    map(params => params['search']?.trim() || '')
  ).subscribe(search => {
    this.searchSubject.next(search);
  });

  this.loadCategories();
}


  loadTests(): void {
    this.testService.getTests().subscribe({
      next: (data: Test[]) => {
        this.tests = data;
        this.totalPages = Math.ceil(this.tests.length / this.pageSize);
        this.updatePagedTests();
      },
      error: (err) => {
        this.error = err.error?.message || 'Ошибка загрузки тестов';
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedTests();
    }
  }

  updatePagedTests(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTests = this.tests.slice(start, end);
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        categories.forEach(cat => {
          this.categoriesMap[cat.id] = cat.name;
        });
      },
      error: (err) => {
        console.error('Ошибка загрузки категорий:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagedTests();
  }

  goToTest(testId: string): void {
    this.router.navigate(['/test', testId]);
  }

  deleteTest(test: Test, event: Event): void {
    event.stopPropagation();
    if (confirm(`Вы уверены, что хотите удалить тест "${test.name}"?`)) {
      this.testService.deleteTest(test.id).subscribe({
        next: (res) => {
          this.snackBar.open(res.message, 'Закрыть', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: 'success-snackbar'
          });
          this.tests = this.tests.filter(t => t.id !== test.id);
          this.totalPages = Math.max(1, Math.ceil(this.tests.length / this.pageSize));
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
          this.updatePagedTests();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Ошибка при удалении теста', 'Закрыть', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  getUniqueCategories(test: Test): string[] {
    if (!test || !test.questions) return [];

    const cats = test.questions.map(q =>
      q.categoryName ? q.categoryName : (this.categoriesMap[q.categoryId] || q.categoryId)
    );

    return Array.from(new Set(cats));
  }
}
