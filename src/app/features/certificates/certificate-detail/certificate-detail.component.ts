import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-certificate-detail',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './certificate-detail.component.html',
})
export class CertificateDetailComponent {
  readonly route = inject(ActivatedRoute);
  readonly certId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly certificate = signal({
    id: '1',
    code: 'CERT-2025-0001',
    participantName: 'Ana García López',
    participantDni: '45678901',
    projectName: 'Seminario de Investigación 2025',
    type: 'Certificado de Participación',
    participationType: 'Expositor',
    status: 'issued' as 'pending' | 'issued' | 'revoked',
    issuedAt: '2025-08-01',
    pdfUrl: '#',
  });

  statusLabel(status: string): string {
    return ({ pending: 'Pendiente', issued: 'Emitido', revoked: 'Revocado' } as Record<string, string>)[status] ?? status;
  }
}
