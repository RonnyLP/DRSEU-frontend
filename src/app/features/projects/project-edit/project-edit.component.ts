import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-project-edit',
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './project-edit.component.html',
})
export class ProjectEditComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly projectId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  form = this.fb.nonNullable.group({
    name: ['Seminario de Investigación 2025', [Validators.required, Validators.minLength(3)]],
    description: ['Evento anual de difusión de investigación universitaria.'],
    startDate: [new Date('2025-03-01') as Date | null, Validators.required],
    endDate: [new Date('2025-07-31') as Date | null, Validators.required],
    status: ['active' as 'draft' | 'active' | 'closed', Validators.required],
  });

  onSubmit(): void {
    if (this.form.valid) {
      // TODO: call project service update
      this.router.navigate(['/projects', this.projectId()]);
    }
  }
}
