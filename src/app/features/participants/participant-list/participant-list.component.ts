import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Participant,
  ParticipantCategory,
  ProjectParticipant,
} from '../../../shared/models/participant.model';
import { ParticipantService } from '../../../core/services/participant.service';

type ParticipantRow = Participant | ProjectParticipant;

@Component({
  selector: 'app-participant-list',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './participant-list.component.html',
})
export class ParticipantListComponent {
  readonly route = inject(ActivatedRoute);
  private participantService = inject(ParticipantService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  readonly projectId = signal(this.route.snapshot.paramMap.get('id'));
  readonly isProjectMode = computed(() => this.projectId() !== null);

  readonly searchControl = new FormControl('');
  readonly categoryControl = new FormControl<ParticipantCategory | ''>('');
  readonly showInactive = signal(false);

  readonly categories: ParticipantCategory[] = [
    'DOCENTE',
    'ALUMNO',
    'ESTUDIANTE',
    'EXTERNO',
    'ADMINISTRATIVO',
    'COORDINADOR',
    'ORGANIZADOR',
    'PONENTE',
    'COLABORADOR',
    'PARTICIPANTE',
    'VOLUNTARIO',
  ];

  readonly displayedColumns = computed(() =>
    this.isProjectMode()
      ? ['nombreCompleto', 'dni', 'email', 'categoria', 'tipoParticipacion', 'actions']
      : ['nombreCompleto', 'dni', 'email', 'categoria', 'activo', 'actions'],
  );

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');
  readonly categoryFilter = signal<ParticipantCategory | ''>('');
  readonly participants = signal<ParticipantRow[]>([]);

  readonly filteredParticipants = computed(() => {
    const filter = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();

    return this.participants().filter((participant) => {
      if (category && participant.categoria !== category) {
        return false;
      }

      if (!filter) {
        return true;
      }

      return [
        participant.nombreCompleto,
        participant.dni,
        participant.email,
        participant.categoria,
        this.participationType(participant),
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(filter));
    });
  });

  readonly resultCount = computed(() => this.filteredParticipants().length);

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.searchTerm.set(value ?? ''));

    this.categoryControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.categoryFilter.set(value ?? ''));

    this.loadParticipants();
  }

  toggleInactive(show: boolean): void {
    this.showInactive.set(show);
    this.loadParticipants();
  }

  loadParticipants(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const projectId = this.projectIdNumber();
    const request =
      this.isProjectMode() && projectId !== null
        ? this.participantService.listByProject(projectId)
        : this.participantService.list('', this.showInactive());

    request.subscribe({
      next: (participants) => {
        this.participants.set(participants);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.extractError(error));
        this.loading.set(false);
      },
    });
  }

  newParticipantLink(): (string | number)[] {
    const projectId = this.projectId();
    return projectId ? ['/projects', projectId, 'participants', 'new'] : ['/participants', 'new'];
  }

  editParticipantLink(row: ParticipantRow): (string | number)[] {
    const projectId = this.projectId();
    const participantId = row.idParticipante;
    return projectId
      ? ['/projects', projectId, 'participants', participantId, 'edit']
      : ['/participants', participantId, 'edit'];
  }

  deleteParticipant(row: ParticipantRow): void {
    const projectId = this.projectIdNumber();
    const message = this.isProjectMode()
      ? `¿Retirar a ${row.nombreCompleto} de este proyecto?`
      : `¿Desactivar a ${row.nombreCompleto}?`;

    if (!confirm(message)) {
      return;
    }

    this.loading.set(true);
    const request =
      this.isProjectMode() && projectId !== null
        ? this.participantService.removeFromProject(projectId, row.idParticipante)
        : this.participantService.deactivate(row.idParticipante);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isProjectMode() ? 'Participante retirado del proyecto' : 'Participante desactivado',
          'Cerrar',
          { duration: 3000 },
        );
        this.loadParticipants();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.extractError(error));
        this.loading.set(false);
      },
    });
  }

  activateParticipant(row: ParticipantRow): void {
    this.loading.set(true);
    this.participantService.activate(row.idParticipante).subscribe({
      next: () => {
        this.snackBar.open('Participante reactivado', 'Cerrar', { duration: 3000 });
        this.loadParticipants();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.extractError(error));
        this.loading.set(false);
      },
    });
  }

  participationType(row: ParticipantRow): string {
    return 'tipoParticipacion' in row ? row.tipoParticipacion : '';
  }

  categoryLabel(category: string): string {
    const labels: Record<string, string> = {
      DOCENTE: 'Docente',
      ALUMNO: 'Alumno',
      ESTUDIANTE: 'Estudiante',
      EXTERNO: 'Externo',
      ADMINISTRATIVO: 'Administrativo',
      COORDINADOR: 'Coordinador',
      ORGANIZADOR: 'Organizador',
      PONENTE: 'Ponente',
      COLABORADOR: 'Colaborador',
      PARTICIPANTE: 'Participante',
      VOLUNTARIO: 'Voluntario',
    };
    return labels[category] ?? category;
  }

  private projectIdNumber(): number | null {
    const projectId = this.projectId();
    if (!projectId) {
      return null;
    }

    const parsed = Number(projectId);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      return error.error;
    }
    return 'No se pudo cargar la información de participantes.';
  }
}
