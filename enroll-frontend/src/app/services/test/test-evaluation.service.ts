import { Injectable } from '@angular/core';
import { Question } from './test.service';

@Injectable({ providedIn: 'root' })
export class TestEvaluationService {
  isAnswerCorrect(question: Question, answer: string): boolean {
    if (!answer || !question.answer) return false;
    return answer.trim().toLowerCase() === question.answer.trim().toLowerCase();
  }

  countCorrectAnswers(questions: Question[], answers: { [index: number]: string }): number {
    return questions.filter((q, i) => this.isAnswerCorrect(q, answers[i])).length;
  }

  getCorrectByCategory(
    questions: Question[],
    answers: { [index: number]: string },
    categoryMap: { [id: string]: string }
  ): { [categoryId: string]: { correct: number; total: number; name: string } } {
    const result: { [id: string]: { correct: number; total: number; name: string } } = {};

    questions.forEach((q, i) => {
      const catId = q.categoryId;
      if (!result[catId]) {
        result[catId] = { correct: 0, total: 0, name: categoryMap[catId] || catId };
      }
      result[catId].total++;
      if (this.isAnswerCorrect(q, answers[i])) {
        result[catId].correct++;
      }
    });

    return result;
  }
}
