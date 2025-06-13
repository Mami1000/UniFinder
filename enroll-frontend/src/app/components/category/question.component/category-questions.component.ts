import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService, CategoryQuestionsResponse } from '../../../services/category/category.service';
import { QuestionService } from '../../../services/question/question.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../../models/question.model';
import { AuthService } from '../../../services/auth/auth.service/auth.service';
import { MediaService } from '../../../services/media/media.service';
@Component({
  selector: 'app-category-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-questions.component.html',
  styleUrls: ['./category-questions.component.css']
})
export class CategoryQuestionsComponent implements OnInit {
  categoryId = '';
  categoryName = '';
  questions: Question[] = [];
  loading = false;
  error = '';

  editQuestionId: string | null = null;
  editedQuestion: Partial<Question> = {};
  editedImage: File | null = null;
  previewImageUrl: string | null = null;
  isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private questionService: QuestionService,
    private authService: AuthService,
    private mediaService: MediaService 
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'admin';
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';

    if (!this.categoryId) {
      this.error = 'Не указан идентификатор категории.';
      return;
    }

    this.loading = true;
    this.categoryService.getQuestionsByCategory(this.categoryId).subscribe({
      next: (resp: CategoryQuestionsResponse) => {
        this.categoryName = resp.name;
        this.questions = resp.questions;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Ошибка получения вопросов';
        this.loading = false;
      }
    });
  }

  editQuestion(question: Question): void {
    this.editQuestionId = question.id!;
    this.editedQuestion = { ...question };
    this.editedImage = null;
    this.previewImageUrl = this.getFullImageUrl(question.imageUrl);
  }

  cancelEdit(): void {
    this.editQuestionId = null;
    this.editedQuestion = {};
    this.editedImage = null;
    this.previewImageUrl = null;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Можно загружать только изображения: PNG, JPEG, JPG, WEBP.');
      return;
    }

    this.editedImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  getFullImageUrl(imageUrl?: string): string {
    return this.questionService.getFullImageUrl(imageUrl);
  }

  saveEditedQuestion(): void {
  if (!this.editQuestionId || !this.editedQuestion) return;

  const submit = (imageFileName?: string) => {
    const formData = new FormData();
    formData.append('text', this.editedQuestion.text ?? '');
    formData.append('answer', this.editedQuestion.answer ?? '');
    formData.append('note', this.editedQuestion.note ?? '');
    formData.append('point', this.editedQuestion.point?.toString() ?? '0');
    formData.append('categoryId', this.editedQuestion.categoryId ?? '');

    if (imageFileName) {
      formData.append('imageUrl', imageFileName); // Прямо название файла, без Blob
    }

    this.questionService.updateQuestion(this.editQuestionId!, formData).subscribe({
      next: (updated) => {
        this.questions = this.questions.map(q =>
          q.id === this.editQuestionId ? { ...q, ...updated.question } : q
        );
        this.cancelEdit();
      },
      error: err => {
        alert('Ошибка обновления: ' + (err.message || 'Неизвестная ошибка'));
      }
    });
  };

  if (this.editedImage) {
    this.mediaService.uploadQuestionImage(this.editedImage as File).subscribe({
      next: (res: { fileName: string }) => submit(res.fileName),
      error: (err: { message?: string }) => alert('Ошибка загрузки изображения: ' + (err.message || ''))
    });
  } else {
    submit();
  }
}
  deleteQuestion(questionId: string): void {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return;

    this.questionService.deleteQuestion(questionId).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.id !== questionId);
      },
      error: err => {
        alert('Ошибка удаления: ' + (err.message || 'Неизвестная ошибка'));
      }
    });
  }

  deleteImage(questionId: string): void {
    if (!confirm('Вы действительно хотите удалить изображение?')) return;

    this.questionService.deleteQuestionImage(questionId).subscribe({
      next: () => {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
          question.imageUrl = '';
        }
      },
      error: err => {
        console.error('Ошибка при удалении изображения:', err);
        alert('Не удалось удалить изображение.');
      }
    });
  }

  getQuestionParts(text: string): [string, string[]] {
    const match = text.match(/([\s\S]+?)\s+(а\).+)/);
    if (!match) return [text, []];
    const question = match[1].trim();
    const optionsString = match[2].trim();
    const options = optionsString.split(/(?=[а-г]\))/);
    return [question, options];
  }
}
