import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

interface IssuanceRequest {
  id: string;
  projectName: string;
  mode: 'single' | 'bulk';
  participantCount: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

@Component({
  selector: 'app-issuance-list',
  imports: [RouterLink, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
  templateUrl: './issuance-list.component.html',
})
export class IssuanceListComponent {
  readonly displayedColumns = ['project', 'mode', 'participantCount', 'status', 'createdAt', 'actions'];

  readonly requests = signal<IssuanceRequest[]>([
    { id: '1', projectName: 'Seminario de Investigación 2025', mode: 'bulk', participantCount: 48, status: 'completed', createdAt: '2025-08-01' },
    { id: '2', projectName: 'Taller de Innovación Tecnológica', mode: 'single', participantCount: 1, status: 'processing', createdAt: '2026-06-14' },
    { id: '3', projectName: 'Jornada de Emprendimiento', mode: 'bulk', participantCount: 0, status: 'queued', createdAt: '2026-06-14' },
  ]);

  statusLabel(status: string): string {
    return ({ queued: 'En cola', processing: 'Procesando', completed: 'Completado', failed: 'Fallido' } as Record<string, string>)[status] ?? status;
  }

  modeLabel(mode: string): string {
    return mode === 'single' ? 'Unitaria' : 'Masiva';
  }
}
