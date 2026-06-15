import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Certificate {
  id: string;
  code: string;
  participantName: string;
  projectName: string;
  type: string;
  status: 'pending' | 'issued' | 'revoked';
  issuedAt: string;
}

@Component({
  selector: 'app-certificate-list',
  imports: [RouterLink, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
  templateUrl: './certificate-list.component.html',
})
export class CertificateListComponent {
  readonly searchControl = new FormControl('');
  readonly statusControl = new FormControl('');

  readonly displayedColumns = ['code', 'participantName', 'projectName', 'type', 'status', 'issuedAt', 'actions'];

  readonly certificates = signal<Certificate[]>([
    { id: '1', code: 'CERT-2025-0001', participantName: 'Ana García López', projectName: 'Seminario de Investigación 2025', type: 'Participación', status: 'issued', issuedAt: '2025-08-01' },
    { id: '2', code: 'CERT-2025-0002', participantName: 'Carlos Mendoza Ríos', projectName: 'Seminario de Investigación 2025', type: 'Ponente', status: 'issued', issuedAt: '2025-08-01' },
    { id: '3', code: 'CERT-2025-0003', participantName: 'María Torres Vega', projectName: 'Taller de Innovación Tecnológica', type: 'Organizador', status: 'pending', issuedAt: '—' },
  ]);

  statusLabel(status: string): string {
    return ({ pending: 'Pendiente', issued: 'Emitido', revoked: 'Revocado' } as Record<string, string>)[status] ?? status;
  }
}
