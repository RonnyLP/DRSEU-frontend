import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectMemberService } from '../../../core/services/project-member.service';
import {
  Integrante,
  ParticipanteSugerencia,
  ProyectoDetalle,
  estadoBadgeClass,
  estadoLabel,
} from '../../../shared/models/proyecto.model';

/**
 * Detalle del proyecto y gestión de integrantes.
 * HU-13: lista ordenada alfabéticamente (la ordena el backend).
 * HU-19: agregar integrantes con sugerencias (autocompletado).
 * HU-20: asignar/cambiar tipo de participación.
 */
@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, ReactiveFormsModule, MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private memberService = inject(ProjectMemberService);
  private snackBar = inject(MatSnackBar);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly estadoLabel = estadoLabel;
  readonly estadoBadgeClass = estadoBadgeClass;

  readonly proyecto = signal<ProyectoDetalle | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly integrantes = signal<Integrante[]>([]);
  readonly cargandoIntegrantes = signal(true);
  readonly tipos = signal<string[]>([]);
  readonly agregando = signal(false);

  readonly integranteColumns = ['nombre', 'email', 'tipo', 'acciones'];

  // HU-19: autocompletado de participantes
  readonly busquedaControl = new FormControl<string | ParticipanteSugerencia>('', { nonNullable: true });
  readonly tipoControl = new FormControl('', { nonNullable: true });
  readonly seleccionado = signal<ParticipanteSugerencia | null>(null);

  readonly sugerencias = toSignal(
    this.busquedaControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((valor) => {
        if (typeof valor !== 'string') {
          return of([] as ParticipanteSugerencia[]);
        }
        this.seleccionado.set(null);
        const q = valor.trim();
        return q.length >= 2
          ? this.memberService.sugerencias(q).pipe(catchError(() => of([] as ParticipanteSugerencia[])))
          : of([] as ParticipanteSugerencia[]);
      }),
    ),
    { initialValue: [] as ParticipanteSugerencia[] },
  );

  ngOnInit(): void {
    this.projectService.getById(this.projectId).subscribe({
      next: (proyecto) => {
        this.proyecto.set(proyecto);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el proyecto');
        this.cargando.set(false);
      },
    });

    this.memberService.tipos().subscribe({
      next: (tipos) => this.tipos.set(tipos),
      error: () => this.tipos.set([]),
    });

    this.cargarIntegrantes();
  }

  cargarIntegrantes(): void {
    this.cargandoIntegrantes.set(true);
    this.memberService.list(this.projectId).subscribe({
      next: (lista) => {
        this.integrantes.set(lista);
        this.cargandoIntegrantes.set(false);
      },
      error: () => {
        this.cargandoIntegrantes.set(false);
        this.mostrar('No se pudieron cargar los integrantes');
      },
    });
  }

  displaySugerencia(s: ParticipanteSugerencia | string | null): string {
    return typeof s === 'object' && s ? `${s.apellidos}, ${s.nombres}` : (s ?? '');
  }

  onSugerenciaSeleccionada(event: MatAutocompleteSelectedEvent): void {
    this.seleccionado.set(event.option.value as ParticipanteSugerencia);
  }

  agregarIntegrante(): void {
    const participante = this.seleccionado();
    const tipo = this.tipoControl.value;
    if (!participante || !tipo || this.agregando()) {
      return;
    }
    this.agregando.set(true);
    this.memberService
      .add(this.projectId, { idParticipante: participante.idParticipante, tipoParticipacion: tipo })
      .subscribe({
        next: () => {
          this.agregando.set(false);
          this.busquedaControl.setValue('');
          this.tipoControl.setValue('');
          this.seleccionado.set(null);
          this.mostrar('Integrante agregado correctamente');
          this.cargarIntegrantes();
        },
        error: (err) => {
          this.agregando.set(false);
          this.mostrar(this.mensajeError(err, 'No se pudo agregar el integrante'));
        },
      });
  }

  cambiarTipo(integrante: Integrante, nuevoTipo: string): void {
    if (nuevoTipo === integrante.tipoParticipacion) {
      return;
    }
    this.memberService
      .updateTipo(this.projectId, integrante.idParticipacion, nuevoTipo, integrante.descripcionParticipante)
      .subscribe({
        next: (actualizado) => {
          this.integrantes.update((lista) =>
            lista.map((i) => (i.idParticipacion === actualizado.idParticipacion ? actualizado : i)),
          );
          this.mostrar('Tipo de participación actualizado');
        },
        error: (err) => {
          this.mostrar(this.mensajeError(err, 'No se pudo cambiar el tipo de participación'));
          this.cargarIntegrantes();
        },
      });
  }

  quitarIntegrante(integrante: Integrante): void {
    if (!confirm(`¿Quitar a ${integrante.apellidos}, ${integrante.nombres} del proyecto?`)) {
      return;
    }
    this.memberService.remove(this.projectId, integrante.idParticipacion).subscribe({
      next: () => {
        this.integrantes.update((lista) =>
          lista.filter((i) => i.idParticipacion !== integrante.idParticipacion),
        );
        this.mostrar('Integrante quitado del proyecto');
      },
      error: (err) => this.mostrar(this.mensajeError(err, 'No se pudo quitar al integrante')),
    });
  }

  tipoLabel(tipo: string): string {
    if (!tipo) return '—';
    return tipo.charAt(0) + tipo.slice(1).toLowerCase();
  }

  private mensajeError(err: { error?: unknown }, porDefecto: string): string {
    return typeof err?.error === 'string' && err.error ? err.error : porDefecto;
  }

  private mostrar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
