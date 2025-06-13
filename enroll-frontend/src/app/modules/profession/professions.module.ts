// src/app/modules/profession/professions.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionsRoutingModule } from './professions-routing.module';
import { ProfessionCreateComponent } from '../../components/profession/profession-create/profession-create.component';

@NgModule({
  declarations: [], 
  imports: [
    CommonModule,
    FormsModule,
    ProfessionsRoutingModule,
    ProfessionCreateComponent 
  ]
})
export class ProfessionsModule {}
