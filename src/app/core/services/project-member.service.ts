import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import {
  Integrante,
  IntegranteInsert,
  ParticipanteSugerencia,
} from '../../shared/models/proyecto.model';

/** Módulo 2 — integrantes de un proyecto (`/api/proyectos/{id}/integrantes`). */
@Injectable({ providedIn: 'root' })
export class ProjectMemberService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/proyectos`;

  /** HU-13: el backend devuelve la lista ordenada por apellidos y nombres. */
  list(idProyecto: number): Observable<Integrante[]> {
    return this.http.get<Integrante[]>(`${this.baseUrl}/${idProyecto}/integrantes`);
  }

  /** HU-19/HU-20: agregar integrante con su tipo de participación. */
  add(idProyecto: number, integrante: IntegranteInsert): Observable<Integrante> {
    return this.http.post<Integrante>(`${this.baseUrl}/${idProyecto}/integrantes`, integrante);
  }

  /** HU-20: cambiar el tipo de participación de un integrante. */
  updateTipo(
    idProyecto: number,
    idParticipacion: number,
    tipoParticipacion: string,
    descripcionParticipante: string | null,
  ): Observable<Integrante> {
    return this.http.put<Integrante>(
      `${this.baseUrl}/${idProyecto}/integrantes/${idParticipacion}`,
      { tipoParticipacion, descripcionParticipante },
    );
  }

  remove(idProyecto: number, idParticipacion: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idProyecto}/integrantes/${idParticipacion}`, {
      responseType: 'text',
    });
  }

  /** HU-19: sugerencias para el autocompletado (mínimo 2 caracteres). */
  sugerencias(q: string): Observable<ParticipanteSugerencia[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<ParticipanteSugerencia[]>(`${this.baseUrl}/integrantes/sugerencias`, {
      params,
    });
  }

  /** HU-20: catálogo de tipos de participación válidos. */
  tipos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/integrantes/tipos`);
  }
}
