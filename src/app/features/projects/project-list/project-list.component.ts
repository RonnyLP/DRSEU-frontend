import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../core/services/project.service';
import {
  ESTADOS_PROYECTO,
  Proyecto,
  estadoBadgeClass,
  estadoLabel,
} from '../../../shared/models/proyecto.model';

/** HU-06: listar proyectos/eventos. */
@Component({
  selector: 'app-project-list',
  imports: [RouterLink, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl('', { nonNullable: true });

  readonly estados = ESTADOS_PROYECTO;
  readonly estadoLabel = estadoLabel;
  readonly estadoBadgeClass = estadoBadgeClass;

  readonly displayedColumns = ['titulo', 'estado', 'numeroRegistro', 'fechaAprobacion', 'integrantes', 'actions'];

  readonly proyectos = signal<Proyecto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  private readonly filtroTexto = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private readonly filtroEstado = toSignal(this.statusControl.valueChanges, { initialValue: '' });

  readonly proyectosFiltrados = computed(() => {
    const q = this.filtroTexto().trim().toLowerCase();
    const estado = this.filtroEstado();
    return this.proyectos().filter(
      (p) =>
        (!q || p.titulo.toLowerCase().includes(q)) &&
        (!estado || p.estado === estado),
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.projectService.list().subscribe({
      next: (lista) => {
        this.proyectos.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de proyectos. Verifica que el backend esté activo.');
        this.cargando.set(false);
      },
    });
  }
}
