import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CertificadoDetalle,
  CertificateFilterParams,
  PageResponse,
  SugerenciaCertificado,
  VerificacionCertificado,
} from '../../shared/models/certificate.model';

const API = `${environment.apiUrl}/certificates`;
const PUBLIC_API = `${environment.apiUrl}/public/certificates`;

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly http = inject(HttpClient);

  list(params: CertificateFilterParams): Observable<PageResponse<CertificadoDetalle>> {
    let p = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);
    if (params.participant) p = p.set('participant', params.participant);
    if (params.status)      p = p.set('status', params.status);
    if (params.code)        p = p.set('code', params.code);
    if (params.projectId)   p = p.set('projectId', params.projectId);
    if (params.typeId)      p = p.set('typeId', params.typeId);
    if (params.dateFrom)    p = p.set('dateFrom', params.dateFrom);
    if (params.dateTo)      p = p.set('dateTo', params.dateTo);
    return this.http.get<PageResponse<CertificadoDetalle>>(API, { params: p });
  }

  suggestions(q: string): Observable<SugerenciaCertificado[]> {
    return this.http.get<SugerenciaCertificado[]>(`${API}/suggestions`, {
      params: new HttpParams().set('q', q),
    });
  }

  getById(id: number): Observable<CertificadoDetalle> {
    return this.http.get<CertificadoDetalle>(`${API}/${id}`);
  }

  downloadBlob(id: number): Observable<Blob> {
    return this.http.get(`${API}/${id}/download`, { responseType: 'blob' });
  }

  previewBlob(id: number): Observable<Blob> {
    return this.http.get(`${API}/${id}/preview`, { responseType: 'blob' });
  }

  verify(code: string): Observable<VerificacionCertificado> {
    return this.http.get<VerificacionCertificado>(`${PUBLIC_API}/verify/${code}`);
  }
}
