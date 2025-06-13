import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService } from '../../services/test/test.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service/auth.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-code-generation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './code-generation.component.html',
  styleUrls: ['./code-generation.component.css']
})
export class CodeGenerationComponent implements OnInit {
  generatedLink: string | null = null;
  copyMessage: string | null = null;
  testId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private authService: AuthService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    // Извлекаем id теста из маршрута, если он передается через параметр, например: /test/detail/67da97...
    this.testId = this.route.snapshot.paramMap.get('id');
  }

  generateCode(): void {
    if (!this.testId) {
      this.copyMessage = 'Идентификатор теста не найден';
      return;
    }
    
    // Получаем идентификатор текущего пользователя из AuthService
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.copyMessage = 'Пользователь не найден';
      return;
    }
    
    // Вызываем серверный метод для генерации кода, передавая testId и userId
    this.testService.getCodeForTest(this.testId, userId).subscribe({
      next: (res) => {
        const key = res.key;  // получаем ключ, например "67da97d8765b1761345ccc1b"
        // Сохраняем только ключ, без формирования URL
        this.generatedLink = key;
      },
      error: (err) => {
        this.copyMessage = err.error?.message || 'Ошибка генерации ссылки';
      }
    });
  }
  copyLink(): void {
    if (this.generatedLink) {
      this.clipboard.copy(this.generatedLink);
      this.copyMessage = 'Ссылка скопирована в буфер обмена';
      setTimeout(() => this.copyMessage = null, 3000);
    }
  }
}
