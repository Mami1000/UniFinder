import { Injectable } from '@angular/core';
import { EmailTemplateService } from '../email/sendtestresultemail/email-template.service';
import { TestService } from './test.service';

@Injectable({ providedIn: 'root' })
export class TestEmailService {
  constructor(
    private emailTemplate: EmailTemplateService,
    private testService: TestService
  ) {}

  sendResultEmail({
    toEmail,
    testName,
    score,
    correctCount,
    totalQuestions,
    correctByCategory,
    recommendations,
    closestProfession,
    neededPoints
  }: {
    toEmail: string;
    testName: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    correctByCategory: any;
    recommendations: any[];
    closestProfession: any;
    neededPoints: number;
  }) {
    const message = this.emailTemplate.composeEmailHtml({
      score,
      correctCount,
      totalQuestions,
      testName,
      correctByCategory,
      recommendations,
      closestProfession,
      neededPoints
    });

    return this.testService.sendMessage({
      ToEmail: toEmail,
      Subject: 'Результаты теста',
      Message: message
    });
  }
}
