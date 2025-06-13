import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card'; 
import { MatIconModule } from '@angular/material/icon';

export interface TestResultData {
  finishSuccess: string;
  correctCount: number;
  totalQuestions: number;
  score: number; 
  categoryResults?: { [key: string]: { name: string; correct: number; total: number } };
}

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
})
export class TestResultComponent {
  @Input() resultData: TestResultData | null = null;
  @Input() emailSent: boolean = false;
  @Input() recommendations: any[] = [];
  @Input() closestProfession: any;
  @Input() neededPoints: number | null = null;

  @Output() sendEmailEvent = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();

  // Обработчик нажатия клавиши Escape
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    event.preventDefault();
    this.onClose();
  }

  onSendEmail(): void {
    this.sendEmailEvent.emit();
  }

  onClose(): void {
    this.closeEvent.emit();
  }
}
