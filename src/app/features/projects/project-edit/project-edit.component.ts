import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { getCurrentUserId } from '../../../core/api.config';
import {
  ESTADOS_PROYECTO,
  EstadoProyecto,
  ProyectoDetalle,
  fromIsoDate,
  toIsoDate,
} from '../../../shared/models/proyecto.model';

@Component({
  selector: 'app-project-edit',
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule],
  templateUrl: './project-edit.component.html',
})
export class ProjectEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private snackBar = inject(MatSnackBar);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));
  readonly estados = ESTADOS_PROYECTO;
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  /** Datos originales para conservar campos que el formulario no edita (creador, aprobador). */
  private original: ProyectoDetalle | null = null;

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    numeroRegistro: [''],
    documentoAprobacion: [''],
    fechaAprobacion: [null as Date | null],
    estado: ['BORRADOR' as EstadoProyecto, Validators.required],
  });

  ngOnInit(): void {
    this.projectService.getById(this.projectId).subscribe({
      next: (proyecto) => {
        this.original = proyecto;
        this.form.patchValue({
          titulo: proyecto.titulo,
          descripcion: proyecto.descripcion ?? '',
          numeroRegistro: proyecto.numeroRegistro ?? '',
          documentoAprobacion: proyecto.documentoAprobacion ?? '',
          fechaAprobacion: fromIsoDate(proyecto.fechaAprobacion),
          estado: proyecto.estado,
        });
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el proyecto');
        this.cargando.set(false);
      },
    });
  }

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
      idCreadoPor: this.original?.idCreadoPor ?? getCurrentUserId(),
      idAprobadoPor: this.original?.idAprobadoPor ?? null,
    };

    this.guardando.set(true);
    this.projectService.update(this.projectId, proyecto).subscribe({
      next: () => {
        this.snackBar.open('Proyecto actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/projects', this.projectId]);
      },
      error: (err) => {
        this.guardando.set(false);
        const mensaje = typeof err?.error === 'string' ? err.error : 'No se pudo actualizar el proyecto';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
