import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-honor-board',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './honor-board.component.html',
  styleUrls: ['./honor-board.component.css'] 
})
export class HonorBoardComponent {
  @Input() honorBoard: { userName: string; score: number }[] = [];
}
