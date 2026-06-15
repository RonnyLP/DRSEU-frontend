import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-participant-edit',
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './participant-edit.component.html',
})
export class ParticipantEditComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly projectId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  form = this.fb.nonNullable.group({
    fullName: ['Ana García López', [Validators.required]],
    dni: ['45678901', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['ana.garcia@untels.edu.pe', [Validators.required, Validators.email]],
    participationType: ['Expositor', Validators.required],
    certificateTypeId: ['1', Validators.required],
  });

  readonly participationTypes = ['Expositor', 'Asistente', 'Organizador', 'Ponente', 'Coordinador'];

  onSubmit(): void {
    if (this.form.valid) {
      this.router.navigate(['/projects', this.projectId(), 'participants']);
    }
  }
}
