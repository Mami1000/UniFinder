import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../components/errors/error-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openError(message: string) {
    return this.dialog.open(ErrorDialogComponent, {
      data: { message },
      width: '300px'
    });
  }
}
