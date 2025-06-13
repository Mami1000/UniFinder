import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionService, Profession } from '../../../services/profession/profession.service';
import { UniversityService, University } from '../../../services/university/university.service';
import { PaginationComponent } from '../../paginatoion/pagination.component'; 
@Component({
  selector: 'app-profession-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './profession-list.component.html',
  styleUrls: ['./profession-list.component.css']
})
export class ProfessionListComponent implements OnInit {
  professions: Profession[] = [];
  pagedProfessions: Profession[] = [];
  universities: University[] = [];
  isLoading = true;
  pageSize = 5;
  currentPage = 1;

  constructor(
    private professionService: ProfessionService,
    private universityService: UniversityService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.professionService.getAllProfessions().subscribe({
      next: data => {
        this.professions = data;
        this.updatePagedProfessions();
        this.universityService.getUniversities().subscribe({
          next: unis => {
            this.universities = unis;
            this.isLoading = false;
          },
          error: err => {
            console.error('Ошибка при загрузке университетов', err);
            this.isLoading = false;
          }
        });
      },
      error: err => {
        console.error('Ошибка при загрузке профессий', err);
        this.isLoading = false;
      }
    });
  }

  updatePagedProfessions(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedProfessions = this.professions.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.professions.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedProfessions();
    }
  }

  getUniversityName(id: string): string {
    return this.universities.find(u => u.id === id)?.name || 'Неизвестно';
  }
}
