import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CertificatesService } from '../../../core/services/certificates.service';
import { VerificacionCertificado } from '../../../shared/models/certificate.model';

type VerifyState = 'idle' | 'loading' | 'valid' | 'invalid';

@Component({
  selector: 'app-verify',
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDividerModule,
  ],
  templateUrl: './verify.component.html',
})
export class VerifyComponent {
  private readonly service = inject(CertificatesService);
  private readonly route = inject(ActivatedRoute);

  readonly codeControl = new FormControl(
    this.route.snapshot.paramMap.get('code') ?? '',
    [Validators.required, Validators.minLength(3)],
  );

  readonly state = signal<VerifyState>('idle');
  readonly result = signal<VerificacionCertificado | null>(null);

  constructor() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) this.onVerify();
  }

  onVerify(): void {
    if (this.codeControl.invalid) return;
    this.state.set('loading');
    this.result.set(null);
    this.service.verify(this.codeControl.value!).subscribe({
      next: (res) => {
        if (res.valido) {
          this.state.set('valid');
          this.result.set(res);
        } else {
          this.state.set('invalid');
        }
      },
      error: () => this.state.set('invalid'),
    });
  }
}
