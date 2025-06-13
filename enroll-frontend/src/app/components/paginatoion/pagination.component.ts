import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  imports: [CommonModule]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  get pages(): (number | string)[] {
    const delta = 2;
    const range: (number | string)[] = [];

    const left = Math.max(2, this.currentPage - delta);
    const right = Math.min(this.totalPages - 1, this.currentPage + delta);

    range.push(1);

    if (left > 2) {
      range.push('...');
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < this.totalPages - 1) {
      range.push('...');
    }

    if (this.totalPages > 1) {
      range.push(this.totalPages);
    }

    return range;
  }

  isNumber(value: number | string): value is number {
    return typeof value === 'number';
  }
}
