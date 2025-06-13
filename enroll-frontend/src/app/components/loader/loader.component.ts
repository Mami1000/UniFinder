// loader.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,             
  imports: [ CommonModule ],      
  template: `
    <div *ngIf="loaderService.isLoading$ | async" class="loader-container">
      <div class="loader"></div>
    </div>
  `,
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
}
