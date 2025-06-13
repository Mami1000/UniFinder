import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { QuestionService } from '../../../services/question/question.service';
import { CategoryService, CategoryQuestionsResponse } from '../../../services/category/category.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { questionFormatValidator } from '../question-format/question-format.validator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { answerValidator } from './answer-validator/answer-validator';
import { Question } from '../../../models/question.model';
@Component({
  selector: 'app-question-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    TextFieldModule
  ],
  templateUrl: './question-create.component.html',
  styleUrls: ['./question-create.component.css']
})
export class QuestionCreateComponent implements OnInit {
  questionForm!: FormGroup;
  error = '';
  categoryId: string = '';
  categoryName: string = '';
  selectedFile?: File; // Храним выбранный файл
  uploadedImageUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Извлекаем идентификатор категории
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    console.log('Извлечённый categoryId:', this.categoryId);

    if (this.categoryId) {
      this.categoryService.getQuestionsByCategory(this.categoryId).subscribe({
        next: (response: CategoryQuestionsResponse) => {
          this.categoryName = response.name;
          console.log('Полученное название категории:', this.categoryName);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Ошибка загрузки категории:', err);
          this.error = 'Ошибка загрузки категории';
        }
      });
    } else {
      this.error = 'Не указан идентификатор категории.';
    }

    // Инициализация формы для создания вопроса
 this.questionForm = this.fb.group({
  text: ['', [Validators.required, Validators.maxLength(500)]],
  answer: ['', [Validators.required, answerValidator()]],  // если нужно оставить свой валидатор для ответа
  note: [''], // Примечание: без валидаторов, значит, не обязательно
  point: [0, Validators.min(0)],  
  categoryId: [this.categoryId, Validators.required]
});

  }
  //Если нужно использовать валидатор для текста вопроса, то его можно добавить в массив валидаторов
    //   this.questionForm = this.fb.group({
    //   text: ['', [Validators.required, questionFormatValidator(), Validators.maxLength(500)]],
    //   answer: ['', [Validators.required, answerValidator()]],
    //   note: [''],
    //   point: [0, Validators.min(0)],
    //   categoryId: [this.categoryId, Validators.required]
    // }); 


  // Обработчик выбора файла
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
       this.selectedFile = target.files[0];
    }
  }

  onSubmit(): void {
  console.log('Вызов onSubmit, форма валидна:', this.questionForm.valid);
  if (!this.questionForm.valid) {
    this.error = 'Проверьте формат и заполните обязательные поля.';
    return;
  }

  const data = this.questionForm.value;
  console.log('Данные формы:', data);

  const formData = new FormData();
  formData.append('text', data.text);
  formData.append('answer', data.answer);
  formData.append('note', data.note && data.note.trim() !== '' ? data.note : '-');
  formData.append('point', data.point.toString());
  formData.append('categoryId', data.categoryId);
  formData.append('categoryName', this.categoryName);

  if (this.selectedFile) {
    formData.append('image', this.selectedFile, this.selectedFile.name);
  }

  console.log('Payload для запроса (FormData):', formData);

  this.questionService.createQuestion(formData).subscribe({
    next: (q: Question) => {
      console.log('Запрос успешен, ответ от сервера:', q);

      if (q.imageUrl) {
        // Если нужно отобразить изображение до редиректа:
        const img = document.createElement('img');
        img.src = q.imageUrl;
        img.alt = 'Загруженное изображение';
        img.style.maxWidth = '300px';
        document.body.appendChild(img); // или лучше через переменную и Angular-шаблон
      }

      // Перенаправляем через 2 секунды (если хочешь паузу)
      setTimeout(() => {
        this.router.navigate([`/category/${this.categoryId}/questions`]);
      }, 2000);
    },
    error: (err: HttpErrorResponse) => {
      console.error('Ошибка создания вопроса:', err);
      this.error = err.message || 'Ошибка создания вопроса';
    }
  });
}

}