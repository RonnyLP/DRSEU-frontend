import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { getCurrentUserId } from '../../../core/api.config';
import {
  ESTADOS_PROYECTO,
  EstadoProyecto,
  ProyectoDetalle,
  toIsoDate,
} from '../../../shared/models/proyecto.model';

/** HU-17: crear nuevo evento/proyecto. */
@Component({
  selector: 'app-project-new',
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './project-new.component.html',
})
export class ProjectNewComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private snackBar = inject(MatSnackBar);

  readonly estados = ESTADOS_PROYECTO;
  readonly guardando = signal(false);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    numeroRegistro: [''],
    documentoAprobacion: [''],
    fechaAprobacion: [null as Date | null],
    estado: ['BORRADOR' as EstadoProyecto, Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid || this.guardando()) {
      return;
    }
    const valores = this.form.getRawValue();
    const proyecto: ProyectoDetalle = {
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim() || null,
      numeroRegistro: valores.numeroRegistro.trim() || null,
      documentoAprobacion: valores.documentoAprobacion.trim() || null,
      fechaAprobacion: toIsoDate(valores.fechaAprobacion),
      estado: valores.estado,
      idCreadoPor: getCurrentUserId(),
      idAprobadoPor: null,
    };

    this.guardando.set(true);
    this.projectService.create(proyecto).subscribe({
      next: () => {
        this.snackBar.open('Proyecto creado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.guardando.set(false);
        const mensaje = typeof err?.error === 'string' ? err.error : 'No se pudo crear el proyecto';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
