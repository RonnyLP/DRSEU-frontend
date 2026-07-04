import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CertificateType, CertificateTypeInsert } from '../../shared/models/certificate-type.model';

const API = `${environment.apiUrl}/certificate-types`;

@Injectable({ providedIn: 'root' })
export class CertificateTypesService {
  private readonly http = inject(HttpClient);

  list(): Observable<CertificateType[]> {
    return this.http.get<CertificateType[]>(API);
  }

  create(dto: CertificateTypeInsert): Observable<CertificateType> {
    return this.http.post<CertificateType>(API, dto);
  }

  update(id: number, dto: CertificateTypeInsert): Observable<CertificateType> {
    return this.http.put<CertificateType>(`${API}/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
