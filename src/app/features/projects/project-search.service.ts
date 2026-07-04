import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProyectoFiltro, ProyectoSearchResult } from '../../shared/models/proyecto-search.model';

@Injectable({ providedIn: 'root' })
export class ProjectSearchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/proyectos`;

  search(filtro: ProyectoFiltro): Observable<ProyectoSearchResult[]> {
    return this.http.get<ProyectoSearchResult[]>(`${this.baseUrl}/search`, {
      params: this.buildParams(filtro),
    });
  }

  sugerencias(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/sugerencias`, {
      params: new HttpParams().set('q', query),
    });
  }

  descargarReporte(filtro: ProyectoFiltro): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reporte`, {
      params: this.buildParams(filtro),
      responseType: 'blob',
    });
  }

  private buildParams(filtro: ProyectoFiltro): HttpParams {
    let params = new HttpParams();
    if (filtro.titulo) params = params.set('titulo', filtro.titulo);
    if (filtro.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde);
    if (filtro.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    return params;
  }
}
