import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyDigits]',
  standalone: true
})
export class OnlyDigitsDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Разрешаем некоторые управляющие клавиши
    const allowedKeys = [
      'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    // Если нажатая клавиша не является цифрой, предотвращаем её ввод
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedInput = event.clipboardData?.getData('text') || '';
    // Если вставляемый текст содержит что-либо, кроме цифр, отменяем вставку
    if (!/^\d+$/.test(pastedInput)) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement;
    // Оставляем в значении только цифры
    const filteredValue = inputElement.value.replace(/\D/g, '');
    if (inputElement.value !== filteredValue) {
      inputElement.value = filteredValue;
      event.stopPropagation();
    }
  }
}
