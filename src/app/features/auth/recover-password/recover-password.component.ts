import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recover-password',
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './recover-password.component.html',
})
export class RecoverPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  submitted = signal(false);
  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    const { email } = this.form.getRawValue();

    this.authService.recoverPassword(email).subscribe({
      next: () => {
        this.submitted.set(true);
        this.loading.set(false);
      },
      error: () => {
        // Siempre muestra éxito para no revelar si el correo existe
        this.submitted.set(true);
        this.loading.set(false);
      },
    });
  }
}
