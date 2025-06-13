import { Component, OnInit } from '@angular/core';
import { QuestionService, BulkQuestionModel } from '../../../../services/question/question.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CategoryService, Category } from '../../../../services/category/category.service';
import { Question } from '../../../../models/question.model';

@Component({
  selector: 'app-bulk-question-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bulk-question-create.component.html',
  styleUrls: ['./bulk-question-create.component.css']
})
export class BulkQuestionCreateComponent implements OnInit {
  bulkForm!: FormGroup;
  error: string = '';
  successMessage: string = '';
  categoryId: string = '';
  categoryName: string = '';

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Извлекаем categoryId из URL (маршрут должен выглядеть как /category/:id/question/bulk-create)
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';

    // Загружаем данные категории для отображения её названия
    if (this.categoryId) {
      this.categoryService.getCategories().subscribe({
        next: (categories: Category[]) => {
          const category = categories.find(cat => cat.id === this.categoryId);
          this.categoryName = category ? category.name : this.categoryId;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Ошибка получения категорий:', err);
          // Если ошибка – можно оставить значение categoryName равным categoryId
        }
      });
    }

    // Инициализируем форму, где пользователь вводит JSON и задаёт балл для всех вопросов
    this.bulkForm = this.fb.group({
      jsonInput: ['', Validators.required],
      point: [1, Validators.min(0)]
    });
  }

  /**
   * Обрабатывает отправку формы для массового создания вопросов.
   * Парсит JSON, проверяет наличие массива вопросов, затем для каждого элемента подготавливает объект Question 
   * и вызывает метод сервиса createQuestion.
   */
 onBulkSubmit(): void {
  if (this.bulkForm.invalid) {
    this.error = 'Введите корректный JSON и необходимые данные.';
    return;
  }
  this.error = '';
  this.successMessage = '';
  
  let jsonData;
  try {
    jsonData = JSON.parse(this.bulkForm.value.jsonInput);
  } catch (e) {
    console.error('Ошибка парсинга JSON:', e);
    this.error = 'Ошибка парсинга JSON. Проверьте формат ввода.';
    return;
  }
  if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
    this.error = 'JSON должен содержать ключ "questions" с массивом вопросов.';
    return;
  }
  const defaultPoint = this.bulkForm.value.point;
  const bulkQuestions: Partial<Question>[] = jsonData.questions.map((q: any) => ({
    text: `${q.question}\na) ${q.a}\nb) ${q.b}\nc) ${q.c}\nd) ${q.d}`,
    answer: q.correct || '',
    categoryId: this.categoryId,
    categoryName: this.categoryName,
    point: defaultPoint,
    imageUrl: q.imageUrl || ''  
  }));

  const bulkPayload: BulkQuestionModel = { questions: bulkQuestions };

  this.questionService.createBulkQuestions(bulkPayload).subscribe({
  next: (responses: Question[]) => {
    console.log('Вопросы успешно созданы:', responses);

    this.successMessage = 'Все вопросы успешно созданы.';
    this.router.navigate([`/category/${this.categoryId}/questions`]);
  },
  error: (err: HttpErrorResponse) => {
    console.error('Ошибка при создании вопросов:', err);
    this.error = err.message || 'Ошибка при создании вопросов.';
  }
});
 }
}
