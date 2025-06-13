import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TestService, CreateTestDto } from '../../../services/test/test.service';
import { CategoryService, Category } from '../../../services/category/category.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OnlyDigitsDirective } from '../../../components/utils/only-digits.directive';

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    OnlyDigitsDirective
  ],
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css']
})
export class CreateTestComponent implements OnInit {
  createTestForm: FormGroup;
  message: string | null = null;
  
  // Массив категорий, загружаемый с сервера
  categories: Category[] = [];
  
  // Ограничение, что можно выбрать максимум 6 категорий
  readonly MAX_CATEGORIES = 6;

  constructor(
    private fb: FormBuilder,
    private testService: TestService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    // Поле "name": обязательно, максимум 20 символов.
    // Поле "time" (время в минутах): обязательно, минимум 1, максимум 240, ввод до 3 цифр.
    this.createTestForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20)]],
      time: [
        '', 
        [
          Validators.required, 
          Validators.min(1), 
          Validators.max(240),
          Validators.pattern(/^[0-9]{1,3}$/)
        ]
      ],
      // Каждая запись – выбранная категория теста.
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: err => {
        this.message = err.error?.message || 'Ошибка загрузки категорий';
      }
    });
  }

  // Геттер для удобного доступа к массиву вопросов (категорий)
  get questions(): FormArray {
    return this.createTestForm.get('questions') as FormArray;
  }

  // Метод для добавления новой категории, если их меньше MAX_CATEGORIES
  addCategory(): void {
    if (this.questions.length >= this.MAX_CATEGORIES) {
      this.message = 'Можно выбрать не более 6 категорий.';
      return;
    }
    const categoryGroup = this.fb.group({
      categoryId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.questions.push(categoryGroup);
    this.message = null;
  }

  // Метод удаления выбранной категории по индексу
  removeCategory(index: number): void {
    this.questions.removeAt(index);
  }

  // Отправка формы: если ни одна категория не добавлена, блокируем отправку.
  onSubmit(): void {
    if (this.createTestForm.invalid) {
      this.message = 'Пожалуйста, заполните все поля корректно!';
      return;
    }
    
    if (this.questions.length === 0) {
      this.message = 'Нужно добавить хотя бы одну категорию!';
      return;
    }
    
    if (this.questions.length > this.MAX_CATEGORIES) {
      this.message = 'Можно выбрать не более 6 категорий.';
      return;
    }

    const formValue = this.createTestForm.value;
    const testData: CreateTestDto = {
      name: formValue.name,
      // Преобразуем минуты в секунды (при условии, что API ожидает время в секундах)
      time: Number(formValue.time) * 60,
      questions: formValue.questions
    };

    this.testService.createTest(testData).subscribe({
      next: (res) => {
        this.message = res.message;
        const createdTestId = res.test.id;
        this.router.navigate(['/test', createdTestId]);
      },
      error: (err) => {
        this.message = err.error?.message || 'Ошибка создания теста';
        console.error('Ошибка:', err);
      }
    });
  }
}
