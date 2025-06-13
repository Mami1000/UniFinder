import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function answerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = (control.value || '').trim();
    const regex = /^[abcdABCD]$/;
    return regex.test(value) ? null : { invalidAnswer: true };
  };
}
