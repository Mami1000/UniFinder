import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CodeGenerationComponent } from '../../code-generation/code-generation.component';
import { TestKeyChatComponent } from '../test-key-chat/test-key-chat.component';
import { HonorBoardComponent } from '../../honor-board/honor-board.component';
import { AuthService } from '../../../services/auth/auth.service/auth.service';
import { TestDetailService } from '../../../services/test/test-detail.service';
import { NotificationService } from '../../../services/utils/notification.service';
import { DialogService } from '../../../services/utils/dialog.service';
import { Test } from '../../../services/test/test.service';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    CodeGenerationComponent,
    TestKeyChatComponent,
    MatSnackBarModule,
    MatTooltipModule,
    HonorBoardComponent
  ],
  templateUrl: './test-detail.component.html',
  styleUrls: ['./test-detail.component.css']
})
export class TestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private detailService = inject(TestDetailService);
  private notification = inject(NotificationService);
  private dialogService = inject(DialogService);

  test: Test | null = null;
  honorBoard: any[] = [];
  generatedLink: string | null = null;
  inputCode: string = '';
  isAdmin: boolean = false;
  isChatVisible = false;
  isChatFocused = false;
  isLoading: boolean = true;

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('id');
    const role = this.authService.getUserRole();
    this.isAdmin = (role?.toLowerCase() === 'admin');
    setTimeout(() => {
        this.isChatVisible = true;
      }, 5000);
    if (!testId) {
      this.dialogService.openError('Идентификатор теста не предоставлен');
      return;
    }

    this.detailService.getTestWithHonorBoard(testId).subscribe({
      next: ({ test, honorBoard }) => {
        this.test = test;
        this.honorBoard = honorBoard;
      },
      error: (err) => this.dialogService.openError(err.error?.message || 'Ошибка загрузки теста')
    });
  }

  generateLink(): void {
      if (!this.test) return;
      const user = this.authService.getCurrentUser();

      if (!user) {
        this.dialogService.openError('Пользователь не найден');
        return;
      }

      this.detailService.getAccessKey(this.test.id, user.id).subscribe({
        next: (key) => this.generatedLink = key,
        error: (err) => this.dialogService.openError(err.error?.message || 'Ошибка генерации ссылки')
      });
    }

    onCodeReceived(code: string): void {
      this.inputCode = code;
    }

    focusChat() {
    this.isChatFocused = true;

    // Автоматически "снимаем фокус" через 10 секунд
    setTimeout(() => {
      this.isChatFocused = false;
    }, 5000);
  }

  takeTestByCode(): void {
    if (!this.inputCode.trim()) {
      this.notification.show('Пожалуйста, введите код теста.');
      return;
    }

    this.router.navigate(['/test/open'], {
      queryParams: {
        key: this.inputCode,
        testId: this.test?.id
      }
    });
  }
}
