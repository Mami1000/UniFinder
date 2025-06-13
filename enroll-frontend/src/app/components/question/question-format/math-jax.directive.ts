import { Directive, ElementRef, AfterViewInit, OnChanges, Input, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appMathJax]'
})
export class MathJaxDirective implements AfterViewInit, OnChanges {
  @Input() appMathJax: string = '';

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.typeset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appMathJax']) {
      this.typeset();
    }
  }

  private typeset(): void {
    // Проверяем, если MathJax загружен
    if ((window as any).MathJax) {
      (window as any).MathJax.typesetPromise([this.el.nativeElement]).catch((err: any) => console.error('MathJax typesetting failed: ', err));
    }
  }
}
