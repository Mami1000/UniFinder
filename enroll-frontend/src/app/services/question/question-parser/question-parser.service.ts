import { Injectable } from '@angular/core';

export interface ParsedQuestion {
  questionText: string;
  options: { letter: string; text: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class QuestionParserService {
  private parsedQuestionsCache: { [text: string]: ParsedQuestion } = {};

  parse(text: string): ParsedQuestion {
    // Если результат для данного текста уже занесён в кэш, возвращаем его
    if (this.parsedQuestionsCache[text]) {
      return this.parsedQuestionsCache[text];
    }
    // Приводим текст к нижнему регистру, чтобы искать «a)» без учета регистра
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf('a)');
    let parsed: ParsedQuestion;
    if (index === -1) {
      // Если вариантов нет – возвращаем оригинальный текст и пустой массив вариантов
      parsed = { questionText: text, options: [] };
    } else {
      const questionText = text.substring(0, index).trim();
      const optionsPart = text.substring(index).trim();
      // Регулярное выражение для поиска вариантов ответа: ищется буква (a–d) и текст варианта до следующей метки или конца строки.
      const regex = /([a-d])\)\s*(.*?)(?=\s+[a-d]\)|$)/gi;
      const options: { letter: string; text: string }[] = [];
      let match;
      while ((match = regex.exec(optionsPart)) !== null) {
        options.push({
          letter: match[1].toLowerCase(),
          text: match[2].trim()
        });
      }
      parsed = { questionText, options };
    }
    // Кэширование результата для этого текста
    this.parsedQuestionsCache[text] = parsed;
    return parsed;
  }
}
