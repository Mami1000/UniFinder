import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function questionFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Берём значение из контрола, убираем пробельные символы по краям
    const value: string = (control.value || '').trim();

    // Если где-либо в строке встречается слово "Ответ:" (без учета регистра),
    // значит формат нарушен.
    if (/Ответ:/i.test(value)) {
      return { invalidFormat: true };
    }

    // Обновлённое регулярное выражение:
    // ^           - начало строки
    // .+\?        - любой текст, заканчивающийся знаком вопроса
    // [ \t]*     - возможные пробелы/табуляции после знака вопроса
    // a\)\s+.+   - вариант a) с хотя бы одним пробелом после ")" и непустым текстом
    // \s+b\)\s+.+ - аналогично для варианта b)
    // \s+c\)\s+.+ - для варианта c)
    // \s+d\)\s+.+ - для варианта d)
    // \s*$       - после текста для d) допускаются только пробельные символы до конца строки
    const regex = /^.+\?[ \t]*a\)\s+.+\s+b\)\s+.+\s+c\)\s+.+\s+d\)\s+.+\s*$/i;
    const valid = regex.test(value);
    return valid ? null : { invalidFormat: true };
  };
}
