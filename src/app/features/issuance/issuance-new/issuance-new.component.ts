import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Participant {
  id: string;
  fullName: string;
  participationType: string;
  selected: boolean;
}

@Component({
  selector: 'app-issuance-new',
  imports: [RouterLink, ReactiveFormsModule, MatStepperModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatRadioModule, MatTableModule, MatCheckboxModule],
  templateUrl: './issuance-new.component.html',
})
export class IssuanceNewComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly projectId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly modeForm = this.fb.nonNullable.group({
    mode: ['single' as 'single' | 'bulk', Validators.required],
    participantId: ['1'],
  });

  readonly typeForm = this.fb.nonNullable.group({
    certificateTypeId: ['1', Validators.required],
  });

  readonly participants = signal<Participant[]>([
    { id: '1', fullName: 'Ana García López', participationType: 'Expositor', selected: false },
    { id: '2', fullName: 'Carlos Mendoza Ríos', participationType: 'Asistente', selected: false },
    { id: '3', fullName: 'María Torres Vega', participationType: 'Organizador', selected: false },
    { id: '4', fullName: 'Luis Huanca Poma', participationType: 'Ponente', selected: false },
  ]);

  readonly displayedColumns = ['select', 'fullName', 'participationType'];

  toggleParticipant(id: string): void {
    this.participants.update(list =>
      list.map(p => p.id === id ? { ...p, selected: !p.selected } : p)
    );
  }

  toggleAll(checked: boolean): void {
    this.participants.update(list => list.map(p => ({ ...p, selected: checked })));
  }

  get selectedCount(): number {
    return this.participants().filter(p => p.selected).length;
  }

  onConfirm(): void {
    this.router.navigate(['/issuance-requests']);
  }
}
