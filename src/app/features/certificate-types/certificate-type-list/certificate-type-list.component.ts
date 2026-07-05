import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CertificateTypesService } from '../../../core/services/certificate-types.service';
import { CertificateType, CertificateTypeInsert } from '../../../shared/models/certificate-type.model';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { CertificateTypeFormDialogComponent } from './certificate-type-form-dialog.component';

@Component({
  selector: 'app-certificate-type-list',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatTooltipModule, MatDialogModule, MatSnackBarModule,
  ],
  templateUrl: './certificate-type-list.component.html',
})
export class CertificateTypeListComponent {
  private readonly service = inject(CertificateTypesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['nombre', 'descripcion', 'predeterminado', 'actions'];
  readonly certificateTypes = signal<CertificateType[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (types) => {
        this.certificateTypes.set(types);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar los tipos de certificado', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(CertificateTypeFormDialogComponent, {
      width: '480px',
      data: null,
    });
    ref.afterClosed().subscribe((result: CertificateTypeInsert | undefined) => {
      if (result) {
        this.service.create(result).subscribe({
          next: () => {
            this.snackBar.open('Tipo creado correctamente', '', { duration: 2000 });
            this.load();
          },
          error: () => this.snackBar.open('Error al crear el tipo', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  openEdit(type: CertificateType): void {
    const ref = this.dialog.open(CertificateTypeFormDialogComponent, {
      width: '480px',
      data: type,
    });
    ref.afterClosed().subscribe((result: CertificateTypeInsert | undefined) => {
      if (result) {
        this.service.update(type.idTipoCertificado, result).subscribe({
          next: () => {
            this.snackBar.open('Tipo actualizado correctamente', '', { duration: 2000 });
            this.load();
          },
          error: () => this.snackBar.open('Error al actualizar el tipo', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  confirmDelete(type: CertificateType): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar tipo de certificado',
        message: `¿Seguro que deseas eliminar "${type.nombre}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.service.remove(type.idTipoCertificado).subscribe({
          next: () => {
            this.snackBar.open('Tipo eliminado', '', { duration: 2000 });
            this.load();
          },
          error: () => this.snackBar.open('Error al eliminar el tipo', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }
}
