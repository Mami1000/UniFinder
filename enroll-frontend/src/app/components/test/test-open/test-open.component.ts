import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TestService, Test, CandidateAnswer, FinishTestDto, Question } from '../../../services/test/test.service';
import { UserService } from '../../../services/user/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TestResultComponent, TestResultData } from '../test-result/test-result.component';
import { ConfirmDialogComponent } from '../../utils/confirm-dialog.component';
import { TestEvaluationService } from '../../../services/test/test-evaluation.service';
import { TestTimerService } from '../../../services/test/test-timer.service';
import { TestEmailService } from '../../../services/test/test-email.service';
import { DialogService } from '../../../services/utils/dialog.service';
import { CategoryService, Category } from '../../../services/category/category.service';
import { QuestionParserService, ParsedQuestion } from '../../../services/question/question-parser/question-parser.service';
import { formatTime } from '../../../services/utils/time-utils';
import { Subscription } from 'rxjs';
import { ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../../environments/environment'; 
@Component({
  selector: 'app-test-open',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatRadioModule,
    TestResultComponent,
  ],
  templateUrl: './test-open.component.html',
  styleUrls: ['./test-open.component.css']
})
export class TestOpenComponent implements OnInit, OnDestroy {
   @ViewChild('scrollTopAnchor') scrollTopAnchor!: ElementRef;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testService = inject(TestService);
  private userService = inject(UserService);
  private categoryService = inject(CategoryService);
  private questionParserService = inject(QuestionParserService);
  private emailService = inject(TestEmailService);
  private evaluationService = inject(TestEvaluationService);
  private dialogService = inject(DialogService);
  private timerService = inject(TestTimerService);
  private dialog = inject(MatDialog);

  key: string | null = null;
  testId: string | null = null;
  test: Test | null = null;
  answers: { [index: number]: string } = {};
  recommendations: any[] = [];
  closestProfession: any = null;
  neededPoints: any = null;
  timeLeft = 0;
  timerSubscription: Subscription | null = null;
  isFinished = false;
  showWarning = false;
  showResultModal = false;
  emailSent = false;
  currentPage = 1;
  pageSize = 5;
  categoryMap: { [id: string]: string } = {};
  testResultData: TestResultData | null = null;
  finishError: string | null = null;

  ngOnInit(): void {
    this.answers = {};
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => data.forEach(cat => this.categoryMap[cat.id] = cat.name),
      error: (err) => console.error('Ошибка загрузки категорий', err)
    });

    this.key = this.route.snapshot.queryParamMap.get('key');
    this.testId = this.route.snapshot.queryParamMap.get('testId');
    if (!this.key || !this.testId) {
      this.dialogService.openError('Ключ теста или ID теста не предоставлены.');
      return;
    }

    this.testService.openTest(this.key, this.testId).subscribe({
    next: (data) => {
    this.test = data;

    this.test.questions.forEach(q => {
      if (q.imageUrl) {
        q.imageUrl = `${environment.apiBaseUrl}/api/media/decrypt-photo?fileName=${q.imageUrl}`;
      }
    });

    this.timeLeft = data.time;
    this.timerSubscription = this.timerService.startCountdown(this.timeLeft).subscribe(time => {
      this.timeLeft = time;
      if (time === 60) this.showWarning = true;
      if (time === 0) this.finishTest(true);
    });
  },
  error: (err) => {
    const dialogRef = this.dialogService.openError(err.error?.message || 'Неверный ключ или ошибка загрузки теста.');
    dialogRef.afterClosed().subscribe(() => {
      if (this.testId) {
        this.router.navigate(['/test', this.testId]);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
});

}

  getParsedQuestion(question: Question): ParsedQuestion {
    if ((<any>question).parsed) return (<any>question).parsed;
    const parsed = this.questionParserService.parse(question.text);
    (<any>question).parsed = parsed;
    return parsed;
  }
  isAnswerCorrect(index: number, question: Question): boolean {
    return this.evaluationService.isAnswerCorrect(question, this.answers[index]);
  }
  get paginatedQuestions(): Question[] {
    if (!this.test?.questions) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.test.questions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return this.test?.questions ? Math.ceil(this.test.questions.length / this.pageSize) : 0;
  }

nextPage(): void {
  if (this.currentPage < this.totalPages && this.allCurrentPageAnswered()) {
    this.currentPage++;
    this.scrollToTop();
  }
}

previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.scrollToTop();
  }
}

private scrollToTop(): void {
  setTimeout(() => {
    this.scrollTopAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }, 0);
}



  allQuestionsAnswered(): boolean {
    return !!this.test?.questions?.every((_, i) => !!this.answers[i]);
  }

confirmFinishTest(): void {
  if (this.isFinished) return;

  if (!this.allQuestionsAnswered()) {
    this.dialogService.openError('Пожалуйста, ответьте на все вопросы.');
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Подтверждение',
      message: 'Вы уверены, что хотите завершить тест? Ответы изменить будет нельзя.'
    }
  });

  dialogRef.afterClosed().subscribe((result: boolean) => {
    if (result) {
      this.finishTest();
    }
  });
}
  finishTest(auto: boolean = false): void {
  this.timerSubscription?.unsubscribe();

  if (this.isFinished || !this.test?.sessionId) return;

  if (!auto && !this.allQuestionsAnswered()) {
    this.dialogService.openError('Пожалуйста, ответьте на все вопросы.');
    return;
  }

  // Автоматически вставим пустые строки для неотвеченных
  const candidateAnswers: CandidateAnswer[] = this.test.questions.map((q, i) => ({
    questionId: q.id || `${this.test!.id}_${i}`,
    answer: this.answers[i] || '' // даже если пустой
  }));

  const dto: FinishTestDto = {
    sessionId: this.test.sessionId,
    answers: candidateAnswers,
    userId: this.userService.getCurrentUser()?.id
  };

  this.testService.finishTest(dto).subscribe({
    next: (res) => {
      this.isFinished = true;
      this.recommendations = res.recommendations?.recommendations || [];
      this.closestProfession = res.recommendations?.closestProfession;
      this.neededPoints = res.recommendations?.neededPoints;

      const correctCount = this.evaluationService.countCorrectAnswers(this.test!.questions, this.answers);
      const categoryResults = this.evaluationService.getCorrectByCategory(this.test!.questions, this.answers, this.categoryMap);

      this.testResultData = {
        finishSuccess: `Тест [${this.test?.name}] завершён! Ваш результат: ${res.score} баллов.`,
        correctCount,
        totalQuestions: this.test?.questions.length || 0,
        categoryResults,
        score: res.score
      };

      this.openResultModal();
    },
    error: (err) => this.dialogService.openError(err.error?.message || 'Ошибка завершения теста.')
  });
}


  sendResultEmail(score: number): void {
    if (this.emailSent) return;
    const user = this.userService.getCurrentUser();
    if (!user?.email) {
      this.dialogService.openError('Не найден email пользователя.');
      return;
    }

    this.emailService.sendResultEmail({
      toEmail: user.email,
      testName: this.test?.name ?? 'Тест',
      score,
      correctCount: this.testResultData?.correctCount ?? 0,
      totalQuestions: this.test?.questions.length ?? 0,
      correctByCategory: this.testResultData?.categoryResults ?? {},
      recommendations: this.recommendations,
      closestProfession: this.closestProfession,
      neededPoints: this.neededPoints
    }).subscribe({
      next: () => this.emailSent = true,
      error: (err: { error: { message: any; }; }) => this.dialogService.openError(err.error?.message || 'Ошибка отправки email.')
    });
  }

  openResultModal(): void {
    this.showResultModal = true;
    setTimeout(() => (document.querySelector('.modal-close-button') as HTMLElement | null)?.focus(), 0);
  }


  closeResultWindow(): void { this.showResultModal = false; }
  goBack(): void { this.router.navigate(['/']); }
  trackByIndex(index: number): number { return (this.currentPage - 1) * this.pageSize + index; }
  onKeyPress(event: KeyboardEvent): void {
    if (!['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(event.key)) event.preventDefault();
  }
  ngOnDestroy(): void { this.timerSubscription?.unsubscribe(); }
  formatTime(seconds: number): string { return formatTime(seconds); }
  allCurrentPageAnswered(): boolean {
  if (!this.test?.questions) return false;
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  return this.test.questions.slice(start, end).every((_, i) => {
    const globalIndex = start + i;
    return !!this.answers[globalIndex];
  });
}

}
