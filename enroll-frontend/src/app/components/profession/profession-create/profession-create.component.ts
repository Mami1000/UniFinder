// src/app/pages/profession-create/profession-create.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionService } from '../../../services/profession/profession.service';
import { UniversityService, University } from '../../../services/university/university.service';

@Component({
  selector: 'app-profession-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profession-create.component.html',
  styleUrls: ['./profession-create.component.css']
})

export class ProfessionCreateComponent {
  name = '';
  minScore: number | null = null;
  universityId = '';
  faculty = '';
  type = 'budget';
  universities: University[] = [];
  
  constructor(
  private professionService: ProfessionService,
  private universityService: UniversityService
) {}

ngOnInit(): void {
  this.universityService.getUniversities().subscribe({
    next: (data) => this.universities = data,
    error: (err) => alert('Ошибка при загрузке университетов: ' + err.message)
  });
}

  create() {
    if (this.name && this.minScore && this.universityId && this.faculty) {
      this.professionService.createProfession({
        name: this.name,
        minScore: this.minScore,
        universityId: this.universityId,
        faculty: this.faculty,
        type: this.type
      }).subscribe({
        next: () => alert('Профессия успешно создана!'),
        error: err => alert('Ошибка при создании: ' + err.message)
      });
    } else {
      alert('Заполните все поля!');
    }
  }
}
