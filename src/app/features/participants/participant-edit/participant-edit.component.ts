import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Participant,
  ParticipantCategory,
  ParticipantPayload,
  ProjectParticipant,
  ProjectParticipantPayload,
} from '../../../shared/models/participant.model';
import { ParticipantService } from '../../../core/services/participant.service';

@Component({
  selector: 'app-participant-edit',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './participant-edit.component.html',
})
export class ParticipantEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private participantService = inject(ParticipantService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  readonly route = inject(ActivatedRoute);

  readonly projectId = signal(this.route.snapshot.paramMap.get('id'));
  readonly participantId = signal(this.route.snapshot.paramMap.get('pid'));
  readonly isProjectMode = computed(() => this.projectId() !== null);
  readonly isEditMode = computed(() => this.participantId() !== null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly pageTitle = computed(() => {
    if (this.isProjectMode()) {
      return this.isEditMode() ? 'Editar participante del proyecto' : 'Añadir participante al proyecto';
    }
    return this.isEditMode() ? 'Editar participante' : 'Registrar participante';
  });

  form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
    email: ['', [Validators.required, Validators.email]],
    celular: ['', [Validators.pattern(/^\d{0,15}$/)]],
    categoria: ['ALUMNO' as ParticipantCategory, Validators.required],
    tipoParticipacion: [''],
    descripcionParticipante: [''],
  });

  readonly categoryOptions: { value: ParticipantCategory; label: string }[] = [
    { value: 'ALUMNO', label: 'Alumno' },
    { value: 'DOCENTE', label: 'Docente' },
    { value: 'EXTERNO', label: 'Externo' },
    { value: 'ADMINISTRATIVO', label: 'Administrativo' },
    { value: 'ESTUDIANTE', label: 'Estudiante' },
  ];

  readonly participationTypes = [
    'COORDINADOR',
    'ORGANIZADOR',
    'PONENTE',
    'COLABORADOR',
    'PARTICIPANTE',
    'VOLUNTARIO',
    'ASISTENTE',
  ];

  ngOnInit(): void {
    if (this.isProjectMode()) {
      this.form.controls.tipoParticipacion.addValidators(Validators.required);
    } else {
      this.form.controls.tipoParticipacion.clearValidators();
    }
    this.form.controls.tipoParticipacion.updateValueAndValidity();

    if (this.isEditMode()) {
      this.loadParticipant();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const projectId = this.projectIdNumber();
    const participantId = this.participantIdNumber();
    this.saving.set(true);
    this.errorMessage.set('');

    const request =
      this.isProjectMode() && projectId !== null
        ? participantId !== null
          ? this.participantService.updateProjectParticipant(
              projectId,
              participantId,
              this.toProjectPayload(),
            )
          : this.participantService.assignToProject(projectId, this.toProjectPayload())
        : participantId !== null
          ? this.participantService.update(participantId, this.toParticipantPayload())
          : this.participantService.create(this.toParticipantPayload());

    request.subscribe({
      next: () => {
        this.snackBar.open('Participante guardado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(this.backLink());
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.extractError(error));
        this.saving.set(false);
      },
    });
  }

  backLink(): (string | number)[] {
    const projectId = this.projectId();
    return projectId ? ['/projects', projectId, 'participants'] : ['/participants'];
  }

  participationLabel(value: string): string {
    const labels: Record<string, string> = {
      COORDINADOR: 'Coordinador',
      ORGANIZADOR: 'Organizador',
      PONENTE: 'Ponente',
      COLABORADOR: 'Colaborador',
      PARTICIPANTE: 'Participante',
      VOLUNTARIO: 'Voluntario',
      ASISTENTE: 'Asistente',
    };
    return labels[value] ?? value;
  }

  private loadParticipant(): void {
    const projectId = this.projectIdNumber();
    const participantId = this.participantIdNumber();
    if (participantId === null) {
      return;
    }

    this.loading.set(true);
    const request =
      this.isProjectMode() && projectId !== null
        ? this.participantService.getByProject(projectId, participantId)
        : this.participantService.get(participantId);

    request.subscribe({
      next: (participant) => {
        this.patchForm(participant);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.extractError(error));
        this.loading.set(false);
      },
    });
  }

  private patchForm(participant: Participant | ProjectParticipant): void {
    this.form.patchValue({
      nombres: participant.nombres,
      apellidos: participant.apellidos,
      dni: participant.dni,
      email: participant.email,
      celular: participant.celular ?? '',
      categoria: participant.categoria,
      tipoParticipacion: 'tipoParticipacion' in participant ? participant.tipoParticipacion : '',
      descripcionParticipante:
        'descripcionParticipante' in participant ? (participant.descripcionParticipante ?? '') : '',
    });
  }

  private toParticipantPayload(): ParticipantPayload {
    const value = this.form.getRawValue();
    return {
      dni: value.dni.trim(),
      nombres: value.nombres.trim(),
      apellidos: value.apellidos.trim(),
      email: value.email.trim(),
      celular: value.celular.trim() || null,
      categoria: value.categoria,
      activo: true,
    };
  }

  private toProjectPayload(): ProjectParticipantPayload {
    const value = this.form.getRawValue();
    return {
      ...this.toParticipantPayload(),
      tipoParticipacion: value.tipoParticipacion.trim(),
      descripcionParticipante: value.descripcionParticipante.trim() || null,
    };
  }

  private projectIdNumber(): number | null {
    const projectId = this.projectId();
    if (!projectId) {
      return null;
    }

    const parsed = Number(projectId);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private participantIdNumber(): number | null {
    const participantId = this.participantId();
    if (!participantId) {
      return null;
    }

    const parsed = Number(participantId);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      return error.error;
    }
    return 'No se pudo guardar el participante.';
  }
}
