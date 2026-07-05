import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Participant,
  ParticipantCategory,
  ParticipantPayload,
  ProjectParticipant,
  ProjectParticipantPayload,
} from '../../shared/models/participant.model';

interface ParticipantApi {
  id?: number;
  idParticipante?: number;
  dni?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  nombreCompleto?: string | null;
  email?: string | null;
  celular?: string | null;
  categoria?: ParticipantCategory | null;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectParticipantApi extends ParticipantApi {
  participacionId?: number;
  idProyecto?: number;
  tipoParticipacion?: string | null;
  descripcionParticipante?: string | null;
}

const API = `${environment.apiUrl}/api`;

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private http = inject(HttpClient);

  list(search = '', includeInactive = false) {
    let params = new HttpParams().set('includeInactive', String(includeInactive));
    if (search.trim()) {
      params = params.set('q', search.trim());
    }

    return this.http
      .get<ParticipantApi[]>(`${API}/participantes`, { params })
      .pipe(map((participants) => participants.map((participant) => this.toParticipant(participant))));
  }

  get(id: number) {
    return this.http
      .get<ParticipantApi>(`${API}/participantes/${id}`)
      .pipe(map((participant) => this.toParticipant(participant)));
  }

  create(payload: ParticipantPayload) {
    return this.http
      .post<ParticipantApi>(`${API}/participantes`, payload)
      .pipe(map((participant) => this.toParticipant(participant)));
  }

  update(id: number, payload: ParticipantPayload) {
    return this.http
      .put<ParticipantApi>(`${API}/participantes/${id}`, payload)
      .pipe(map((participant) => this.toParticipant(participant)));
  }

  deactivate(id: number) {
    return this.http
      .delete(`${API}/participantes/${id}`, { responseType: 'text' })
      .pipe(map(() => undefined));
  }

  activate(id: number) {
    return this.http
      .patch<ParticipantApi>(`${API}/participantes/${id}/activar`, {})
      .pipe(map((participant) => this.toParticipant(participant)));
  }

  listByProject(projectId: number) {
    return this.http
      .get<ProjectParticipantApi[]>(`${API}/participaciones/proyecto/${projectId}`)
      .pipe(
        map((participants) =>
          participants.map((participant) => this.toProjectParticipant(participant)),
        ),
      );
  }

  getByProject(projectId: number, participantId: number) {
    return this.http
      .get<ProjectParticipantApi>(
        `${API}/participaciones/proyecto/${projectId}/participantes/${participantId}`,
      )
      .pipe(map((participant) => this.toProjectParticipant(participant)));
  }

  assignToProject(projectId: number, payload: ProjectParticipantPayload) {
    return this.http
      .post<ProjectParticipantApi>(`${API}/participaciones/proyecto/${projectId}`, payload)
      .pipe(map((participant) => this.toProjectParticipant(participant)));
  }

  updateProjectParticipant(
    projectId: number,
    participantId: number,
    payload: ProjectParticipantPayload,
  ) {
    return this.http
      .put<ProjectParticipantApi>(
        `${API}/participaciones/proyecto/${projectId}/participantes/${participantId}`,
        payload,
      )
      .pipe(map((participant) => this.toProjectParticipant(participant)));
  }

  removeFromProject(projectId: number, participantId: number) {
    return this.http
      .delete(`${API}/participaciones/proyecto/${projectId}/participantes/${participantId}`, {
        responseType: 'text',
      })
      .pipe(map(() => undefined));
  }

  private toParticipant(participant: ParticipantApi): Participant {
    const id = participant.idParticipante ?? participant.id ?? 0;
    const nombres = participant.nombres ?? '';
    const apellidos = participant.apellidos ?? '';
    const nombreCompleto = participant.nombreCompleto?.trim() || `${nombres} ${apellidos}`.trim();

    return {
      id,
      idParticipante: id,
      dni: participant.dni ?? '',
      nombres,
      apellidos,
      nombreCompleto,
      email: participant.email ?? '',
      celular: participant.celular ?? null,
      categoria: participant.categoria ?? 'ALUMNO',
      activo: participant.activo ?? true,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
    };
  }

  private toProjectParticipant(participant: ProjectParticipantApi): ProjectParticipant {
    return {
      ...this.toParticipant(participant),
      participacionId: participant.participacionId ?? 0,
      idProyecto: participant.idProyecto ?? 0,
      tipoParticipacion: participant.tipoParticipacion ?? '',
      descripcionParticipante: participant.descripcionParticipante ?? null,
    };
  }
}
