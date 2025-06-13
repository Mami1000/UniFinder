import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../../services/category/category.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service/auth.service'; // убедитесь, что путь верный

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  pagedCategories: Category[] = [];
  loading = false;
  error = '';
  isAdmin: boolean = false;

  pageSize = 6;
  currentPage = 1;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'admin';

    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.updatePagedCategories();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Ошибка загрузки категорий';
        this.loading = false;
      }
    });
  }

  updatePagedCategories(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedCategories = this.categories.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.categories.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedCategories();
    }
  }

  viewQuestions(categoryId: string): void {
    this.router.navigate(['/category', categoryId, 'questions']);
  }

  createQuestion(categoryId: string): void {
    this.router.navigate(['/category', categoryId, 'question', 'create']);
  }

  createBulkQuestion(categoryId: string): void {
    this.router.navigate(['/category', categoryId, 'question', 'bulk-create']);
  }
}
