import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TestService } from '../../services/test/test.service';
import { catchError, map } from 'rxjs/operators';

export interface BotResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class BotService {
  constructor(private testService: TestService) {}

  /**
   * Проверяет наличие хотя бы одного ключевого слова в сообщении.
   */
  private containsKeyword(keywords: string[], text: string): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Обрабатывает сообщение пользователя и возвращает ответ бота.
   */
  processUserMessage(
    message: string,
    currentUserId: string,
    testId: string
  ): Observable<BotResponse> {
    const lowerMessage = message.toLowerCase();
    const normalizedMessage = lowerMessage.replace(/[.,!?()\-]/g, '').trim();

    // Правила ответа
    const rules: {
      condition: (msg: string) => boolean;
      reply?: string;
      async?: boolean;
      handler?: () => Observable<BotResponse>;
    }[] = [
      {
        condition: msg => msg === 'да',
        reply:
          'Можете, пожалуйста, уточнить ваш запрос? Например, если вам нужен код теста, напишите "код" или "ключ".'
      },
      {
        condition: msg =>
          this.containsKeyword(['ключ', 'код', 'хочу пройти тест', 'code', 'kod'], msg),
        async: true,
        handler: () =>
          this.testService.getCodeForTest(testId, currentUserId).pipe(
            map((res: any) => ({ reply: `Ваш код: ${res.key}` })),
            catchError(err => {
              const msg = err?.error?.message || 'Ошибка при генерации кода теста.';
              return of({ reply: msg });
            })
          )
      },
      {
        condition: msg =>
          this.containsKeyword(
            ['привет', 'здравствуйте', 'добрый день', 'доброе утро', 'добрый вечер'],
            msg
          ),
        reply: 'Здравствуйте! Рада вас видеть. Чем могу помочь?'
      },
      {
        condition: msg => this.containsKeyword(['спасибо', 'благодарю'], msg),
        reply: 'Пожалуйста! Если нужна будет помощь, обращайтесь.'
      },
      {
        condition: msg => this.containsKeyword(['как дела', 'что нового'], msg),
        reply: 'У меня всё в порядке. А у вас?'
      },
      {
        condition: msg => this.containsKeyword(['помоги', 'подскажешь', 'не могу'], msg),
        reply: 'Конечно, расскажите, в чём у вас проблема, и я постараюсь помочь.'
      }
    ];

    // Обработка по правилам
    for (const rule of rules) {
      if (rule.condition(normalizedMessage)) {
        if (rule.async && rule.handler) {
          return rule.handler();
        }
        return of({ reply: rule.reply! });
      }
    }

    // Ответ по умолчанию
    return of({
      reply:
        'Извините, я не до конца понял ваш запрос. Пожалуйста, уточните, что именно вы хотите сделать или узнать.'
    });
  }
}
