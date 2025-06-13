import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category/category.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Импорт Angular Material модулей
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
    ],
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css']
})
export class CategoryCreateComponent implements OnInit {
  categoryForm!: FormGroup; // Инициализация перенесена в ngOnInit
  error = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''] // теперь поле есть, оно необязательно
    });
  }
  
  onSubmit(): void {
    if (this.categoryForm.valid) {
      // Если описания не указано, отправляем пустую строку
      const categoryData = { 
        name: this.categoryForm.value.name ?? '',
        description: this.categoryForm.value.description ?? '' 
      };
      this.categoryService.createCategory(categoryData)
        .subscribe({
          next: (cat) => {
            this.router.navigate(['/categories']);
          },
          error: (err) => {
            this.error = err.message || 'Ошибка создания категории';
          }
        });
    }
  }
  
}
