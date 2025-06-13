import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  buildCategoriesHtml(categories: any): string {
    let html = '';
    for (const catId in categories) {
      if (categories.hasOwnProperty(catId)) {
        const cat = categories[catId];
        html += `
          <tr>
            <td style="padding: 5px 10px; border: 1px solid #ddd;">${cat.name}</td>
            <td style="padding: 5px 10px; border: 1px solid #ddd;">${cat.correct} из ${cat.total}</td>
          </tr>
        `;
      }
    }
    return html;
  }

  buildRecommendationsHtml(recommendations: any[]): string {
    if (!recommendations?.length) return '';

    let html = '';
    for (const rec of recommendations) {
      html += `
        <h4 style="margin-bottom: 5px;">${rec.university} (${rec.location})</h4>
        <ul style="margin-top: 0;">`;
      for (const prog of rec.programs) {
        html += `<li><strong>${prog.name}</strong> — ${prog.faculty} (${prog.type}, проходной: ${prog.minScore})</li>`;
      }
      html += '</ul>';
    }
    return html;
  }

  composeEmailHtml(params: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    testName: string;
    correctByCategory: { [key: string]: any };
    recommendations?: any[];
    closestProfession?: {
      name: string;
      faculty: string;
      type: string;
      university: string;
      location: string;
      logoUrl?: string;
    };
    neededPoints?: number;
  }): string {
    const categoriesHtml = this.buildCategoriesHtml(params.correctByCategory);
    let recommendationsHtml = '';

    if (params.recommendations?.length) {
      recommendationsHtml = this.buildRecommendationsHtml(params.recommendations);
    } else if (params.closestProfession) {
      const cp = params.closestProfession;
      recommendationsHtml = `
        <p><strong>Название:</strong> ${cp.name}</p>
        <p><strong>Факультет:</strong> ${cp.faculty}</p>
        <p><strong>Тип обучения:</strong> ${cp.type === 'paid' ? 'Платное' : 'Бюджет'}</p>
        <p><strong>Университет:</strong> ${cp.university}</p>
        <p><strong>Адрес:</strong> ${cp.location}</p>
        <p><strong>Не хватает баллов:</strong> ${params.neededPoints}</p>
      `;
    }

    return this.generateEmailTemplate({
      score: params.score,
      correctCount: params.correctCount,
      totalQuestions: params.totalQuestions,
      testName: params.testName,
      categoriesHtml,
      recommendationsHtml,
      closestProfession: params.closestProfession && typeof params.neededPoints === 'number'
        ? { name: params.closestProfession.name, minScore: params.neededPoints }
        : undefined,
      neededPoints: params.neededPoints,
    });
  }

  generateEmailTemplate(data: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    testName: string;
    categoriesHtml: string;
    recommendationsHtml?: string;
    closestProfession?: { name: string; minScore: number };
    neededPoints?: number;
  }): string {
    const neededPointsBlock = data.neededPoints && data.closestProfession
      ? `
        <p style="font-size:16px; margin:20px 0;">
          До ближайшей специальности <strong>${data.closestProfession.name}</strong> 
          не хватает <strong>${data.neededPoints}</strong> баллов (проходной: ${data.closestProfession.minScore}).
        </p>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8" /></head>
        <body style="margin:0; padding:0; background-color:#f0f0f0; font-family:Arial, sans-serif;">
          <table width="100%" bgcolor="#f0f0f0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:20px;">
                <table width="600" bgcolor="#ffffff" style="border-radius:8px; overflow:hidden;">
                  <tr>
                    <td align="center" bgcolor="#009688" style="padding:20px;">
                      <h1 style="color:#fff;">Поздравляем с прохождением теста ${data.testName}!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px; color:#333;">
                      <h2 style="color:#009688;">Ваш тест завершён</h2>
                      <p style="font-size:18px;">
                        Ваш результат: <span style="font-size:24px; color:#4CAF50;"><strong>${data.score} баллов</strong></span>
                      </p>
                      <p style="font-size:18px;">
                        Правильных ответов: <strong>${data.correctCount}</strong> из <strong>${data.totalQuestions}</strong>
                      </p>

                      <h3 style="color:#009688;">Результаты по категориям</h3>
                      <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:20px;">
                        <tr>
                          <th style="padding: 5px 10px; border: 1px solid #ddd;">Категория</th>
                          <th style="padding: 5px 10px; border: 1px solid #ddd;">Результат</th>
                        </tr>
                        ${data.categoriesHtml}
                      </table>

                      ${data.recommendationsHtml
                        ? `<h3 style="color:#009688;">🎓 Рекомендации по поступлению</h3>${data.recommendationsHtml}`
                        : neededPointsBlock}

                      <p style="font-size:16px; margin:20px 0;">
                        Благодарим за прохождение теста. Удачи в поступлении!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#eeeeee" style="padding:15px; font-size:12px; color:#777;">
                      &copy; 2025 UniFinder. Все права защищены.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}
