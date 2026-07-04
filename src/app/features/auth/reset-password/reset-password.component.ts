import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): Record<string, boolean> | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hidePassword = signal(true);
  hideConfirm = signal(true);
  loading = signal(false);
  success = signal(false);
  errorMessage = signal('');
  private resetToken = '';

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.resetToken) {
      this.errorMessage.set('El enlace de recuperación no es válido.');
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.resetToken) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { password } = this.form.getRawValue();

    this.authService.resetPassword(this.resetToken, password).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: () => {
        this.errorMessage.set('El enlace ha expirado o ya fue usado. Solicita uno nuevo.');
        this.loading.set(false);
      },
    });
  }
}
