import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CertificateType, CertificateTypeInsert } from '../../../shared/models/certificate-type.model';

@Component({
  selector: 'app-certificate-type-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} tipo de certificado</h2>

    <mat-dialog-content>
      <form [formGroup]="form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Certificado de Participación">
          @if (form.controls.nombre.hasError('required')) {
            <mat-error>El nombre es obligatorio</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3"
                    placeholder="Descripción del tipo de certificado"></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="esPredeterminado">Marcar como predeterminado</mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data ? 'Guardar cambios' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class CertificateTypeFormDialogComponent {
  readonly data = inject<CertificateType | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CertificateTypeFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data?.nombre ?? '', Validators.required],
    descripcion: [this.data?.descripcion ?? ''],
    esPredeterminado: [this.data?.esPredeterminado ?? false],
  });

  submit(): void {
    if (this.form.invalid) return;
    const result: CertificateTypeInsert = this.form.getRawValue();
    this.dialogRef.close(result);
  }
}
