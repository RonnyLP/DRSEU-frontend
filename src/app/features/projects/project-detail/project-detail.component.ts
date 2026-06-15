import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent {
  readonly route = inject(ActivatedRoute);
  readonly projectId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly project = signal({
    id: '1',
    name: 'Seminario de Investigación 2025',
    description: 'Evento anual de difusión de investigación universitaria organizado por la UNTELS.',
    status: 'active' as 'draft' | 'active' | 'closed',
    startDate: '2025-03-01',
    endDate: '2025-07-31',
    participantCount: 48,
    hasTemplate: true,
  });

  statusLabel(status: string): string {
    return ({ draft: 'Borrador', active: 'Activo', closed: 'Cerrado' } as Record<string, string>)[status] ?? status;
  }
}
