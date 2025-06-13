import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, NgIf, NgClass } from '@angular/common';
import { RouterModule, Router, NavigationEnd, Event } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service/auth.service';
import { UserService, User } from '../../services/user/user.service';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgClass, FormsModule, ReactiveFormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  // Статусы пользователя и меню
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  menuOpen: boolean = false;

  // Свойства для отображения информации пользователя
  userName: string = '';
  userPoints: number = 0;
  hoveringMenu: boolean = false;

  // FormControl для live-поиска
  searchControl: FormControl = new FormControl('');

  darkMode: boolean = false;
  currentFontSize = 16; // Начальный размер шрифта

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Подписка на статус авторизации
    this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      if (status) {
        const currentUser: User | null = this.userService.getCurrentUser();
        if (currentUser) {
          this.userName = currentUser.name;
          this.userPoints = currentUser.userpoint;
          this.isAdmin = currentUser.role === 'admin';
        }
        const storedFontSize = localStorage.getItem('fontSize');
        if (storedFontSize) {
          this.currentFontSize = Number(storedFontSize);
          this.applyFontSize();
        }
      } else {
        this.userName = '';
        this.userPoints = 0;
        this.isAdmin = false;
        document.documentElement.style.removeProperty('--base-font-size');
      }
    });

    // Проверка сохранённой темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.darkMode = true;
      document.body.classList.add('dark-mode');
    }

    // Подписка на изменения значения поиска для live‑поиска
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),          // ждём 300 мс после последнего ввода
        distinctUntilChanged()      // реагируем только на изменение значения
      )
      .subscribe((value: string) => {
        this.executeSearch(value);
      });

    // Подписка на события навигации:
    // Если новый URL НЕ начинается с '/test/list' — очищаем поле поиска.
    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        if (!event.urlAfterRedirects.startsWith('/test/list')) {
          this.searchControl.reset();
        }
      });
  }

  // Метод, который выполняет навигацию с query-параметром
  private executeSearch(value: string): void {
  const query = (value || '').trim();
    if (query) {
      // Если запрос непустой — обновляем query-параметр, остаёмся на той же странице.
      this.router.navigate([], {
        queryParams: { search: query },
        queryParamsHandling: 'merge'
      });
    } else {
      // Если запрос пустой — убираем query-параметр и очищаем поле.
      this.router.navigate([], {
        queryParams: { search: null },
        queryParamsHandling: 'merge'
      }).then(() => {
        this.searchControl.reset();
      });
    }
  }
  
  // Метод ручного поиска (при клике на кнопку)
  manualSearch(): void {
    const value: string = this.searchControl.value;
    this.executeSearch(value);
  }

  // При клике по логотипу — переход на главную
  navigateHome(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/test/list']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen &&
      event.target instanceof Node &&
      !this.elementRef.nativeElement.querySelector('.dropdown')?.contains(event.target)
    ) {
      this.menuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  increaseFontSize(): void {
    if (this.currentFontSize < 36) {
      this.currentFontSize += 1;
      this.applyFontSize();
    }
  }

  decreaseFontSize(): void {
    if (this.currentFontSize > 10) {
      this.currentFontSize -= 1;
      this.applyFontSize();
    }
  }

  private applyFontSize(): void {
    const routesWithoutScaling: string[] = ['/login', '/register'];
    const currentUrl = this.router.url;
    if (routesWithoutScaling.some(route => currentUrl.startsWith(route))) {
      document.documentElement.style.removeProperty('--base-font-size');
      return;
    }
    document.documentElement.style.setProperty('--base-font-size', this.currentFontSize + 'px');
    localStorage.setItem('fontSize', String(this.currentFontSize));
  }
}
