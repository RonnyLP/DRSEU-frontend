import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Participant {
  id: string;
  fullName: string;
  dni: string;
  email: string;
  participationType: string;
}

@Component({
  selector: 'app-participant-list',
  imports: [RouterLink, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule, MatCheckboxModule],
  templateUrl: './participant-list.component.html',
})
export class ParticipantListComponent {
  readonly route = inject(ActivatedRoute);
  readonly projectId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly searchControl = new FormControl('');
  readonly displayedColumns = ['select', 'fullName', 'dni', 'email', 'participationType', 'actions'];

  readonly participants = signal<Participant[]>([
    { id: '1', fullName: 'Ana García López', dni: '45678901', email: 'ana.garcia@untels.edu.pe', participationType: 'Expositor' },
    { id: '2', fullName: 'Carlos Mendoza Ríos', dni: '32145678', email: 'carlos.mendoza@untels.edu.pe', participationType: 'Asistente' },
    { id: '3', fullName: 'María Torres Vega', dni: '56789012', email: 'maria.torres@untels.edu.pe', participationType: 'Organizador' },
    { id: '4', fullName: 'Luis Huanca Poma', dni: '78901234', email: 'luis.huanca@untels.edu.pe', participationType: 'Ponente' },
  ]);
}
