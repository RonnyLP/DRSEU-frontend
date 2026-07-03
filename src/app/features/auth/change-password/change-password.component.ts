import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): Record<string, boolean> | null {
  const password = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-change-password',
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hideCurrent = signal(true);
  hideNew = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.errorMessage.set('La contraseña actual es incorrecta.');
        this.loading.set(false);
      },
    });
  }
}
