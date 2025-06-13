import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UniversityService, University } from '../../../services/university/university.service';
import { AuthService } from '../../../services/auth/auth.service/auth.service';
import { MediaService } from '../../../services/media/media.service';
import { PaginationComponent } from '../../paginatoion/pagination.component';
@Component({
  selector: 'app-university-list',
  templateUrl: './university-list.component.html',
  styleUrls: ['./university-list.component.css'],
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class UniversityListComponent implements OnInit {
  universities: University[] = [];
  loading = false;
  error = '';
  isAdmin = false;
  displayedUniversities: University[] = [];
  logoUrlCache: { [key: string]: string } = {};
  loadedLogos: { [key: string]: boolean } = {};
currentPage = 1;
pageSize = 6;
  constructor(private universityService: UniversityService, private router: Router, private authService: AuthService,
      private mediaService: MediaService, private cdr: ChangeDetectorRef,
      

  ) {}
  ngOnInit(): void {
    this.fetchUniversities();
    const role = this.authService.getUserRole(); 
    this.isAdmin = role === 'admin';
  }
  get totalPages(): number {
    return Math.ceil(this.universities.length / this.pageSize);
  }
  fetchUniversities(): void {
    this.loading = true;
    this.universityService.getUniversities().subscribe({
      next: (data: University[]) => {
        this.universities = data;
        this.setDisplayedUniversities();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Ошибка загрузки данных';
        this.loading = false;
      }
    });
  }
  viewDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/universities', id]);
    }
  }
  onImageLoad(fileName: string): void {
  this.loadedLogos[fileName] = true;
}
  // Pagination logic
    changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.setDisplayedUniversities();

      // Прокрутка к началу списка
      const listElement = document.querySelector('.university-list');
      if (listElement) {
        listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

setDisplayedUniversities(): void {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  this.displayedUniversities = [...this.universities.slice(start, end)];
  this.cdr.markForCheck(); 
}

  

    goToCreate(): void {
      this.router.navigate(['/universities/create']);
    }
    trackById(index: number, uni: University): string {
      return uni.id!;
    }

    getLogoUrl(fileName: string): string {
  if (!fileName) return '';
  if (!this.logoUrlCache[fileName]) {
    this.logoUrlCache[fileName] = this.mediaService.getDecryptedPhotoUrl(fileName);
  }
  return this.logoUrlCache[fileName];
}
}
