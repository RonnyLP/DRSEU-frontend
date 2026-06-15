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

interface Project {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'closed';
  startDate: string;
  endDate: string;
  participantCount: number;
}

@Component({
  selector: 'app-project-list',
  imports: [RouterLink, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent {
  readonly searchControl = new FormControl('');
  readonly statusControl = new FormControl('');

  readonly displayedColumns = ['name', 'status', 'startDate', 'endDate', 'participants', 'actions'];

  readonly projects = signal<Project[]>([
    { id: '1', name: 'Seminario de Investigación 2025', status: 'active', startDate: '2025-03-01', endDate: '2025-07-31', participantCount: 48 },
    { id: '2', name: 'Taller de Innovación Tecnológica', status: 'active', startDate: '2025-04-01', endDate: '2025-09-30', participantCount: 32 },
    { id: '3', name: 'Congreso Estudiantil UNTELS 2024', status: 'closed', startDate: '2024-11-01', endDate: '2024-11-30', participantCount: 120 },
    { id: '4', name: 'Jornada de Emprendimiento', status: 'draft', startDate: '2026-01-01', endDate: '2026-06-30', participantCount: 0 },
  ]);

  statusLabel(status: string): string {
    return ({ draft: 'Borrador', active: 'Activo', closed: 'Cerrado' } as Record<string, string>)[status] ?? status;
  }
}
