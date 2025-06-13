import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appOnlyAnswerChars]'
})
export class OnlyAnswerCharsDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const allowedChars = ['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'];
    if (!allowedChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text') || '';
    const allowedCharsRegEx = /^[abcdABCD]$/;
    if (!allowedCharsRegEx.test(clipboardData.trim())) {
      event.preventDefault();
    }
  }
}
