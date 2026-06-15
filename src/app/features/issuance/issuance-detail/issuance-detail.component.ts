import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

interface GeneratedCertificate {
  id: string;
  participantName: string;
  code: string;
  status: 'issued' | 'failed';
}

@Component({
  selector: 'app-issuance-detail',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatDividerModule, MatTableModule],
  templateUrl: './issuance-detail.component.html',
})
export class IssuanceDetailComponent {
  readonly route = inject(ActivatedRoute);
  readonly requestId = signal(this.route.snapshot.paramMap.get('rid') ?? '');

  readonly request = signal({
    id: '1',
    projectName: 'Seminario de Investigación 2025',
    mode: 'bulk' as 'single' | 'bulk',
    status: 'completed' as 'queued' | 'processing' | 'completed' | 'failed',
    total: 48,
    processed: 48,
    createdAt: '2025-08-01',
  });

  readonly certificates = signal<GeneratedCertificate[]>([
    { id: '1', participantName: 'Ana García López', code: 'CERT-2025-0001', status: 'issued' },
    { id: '2', participantName: 'Carlos Mendoza Ríos', code: 'CERT-2025-0002', status: 'issued' },
    { id: '3', participantName: 'María Torres Vega', code: 'CERT-2025-0003', status: 'issued' },
  ]);

  readonly displayedColumns = ['participantName', 'code', 'status', 'actions'];

  get progress(): number {
    const req = this.request();
    return req.total > 0 ? (req.processed / req.total) * 100 : 0;
  }

  statusLabel(status: string): string {
    return ({ queued: 'En cola', processing: 'Procesando', completed: 'Completado', failed: 'Fallido' } as Record<string, string>)[status] ?? status;
  }
}
