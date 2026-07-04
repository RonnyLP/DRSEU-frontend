import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Proyecto, ProyectoDetalle } from '../../shared/models/proyecto.model';

/** Módulo 2 — CRUD de proyectos contra `/api/proyectos`. */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/proyectos`;

  /** HU-06: listar proyectos con conteo de integrantes. */
  list(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.baseUrl}/lista`);
  }

  getById(id: number): Observable<ProyectoDetalle> {
    return this.http.get<ProyectoDetalle>(`${this.baseUrl}/${id}`);
  }

  /** HU-17: crear nuevo proyecto/evento. */
  create(proyecto: ProyectoDetalle): Observable<ProyectoDetalle> {
    return this.http.post<ProyectoDetalle>(`${this.baseUrl}/nuevo`, proyecto);
  }

  update(id: number, proyecto: ProyectoDetalle): Observable<ProyectoDetalle> {
    return this.http.put<ProyectoDetalle>(`${this.baseUrl}/${id}`, proyecto);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
