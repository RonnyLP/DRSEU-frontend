import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

type VerifyState = 'idle' | 'loading' | 'valid' | 'invalid';

@Component({
  selector: 'app-verify',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './verify.component.html',
})
export class VerifyComponent {
  readonly route = inject(ActivatedRoute);

  readonly codeControl = new FormControl(
    this.route.snapshot.paramMap.get('code') ?? '',
    [Validators.required, Validators.minLength(6)]
  );

  readonly state = signal<VerifyState>('idle');

  readonly result = signal<{ participantName: string; projectName: string; type: string; issuedAt: string } | null>(null);

  onVerify(): void {
    if (this.codeControl.invalid) return;
    this.state.set('loading');
    // TODO: call public verify API
    setTimeout(() => {
      this.state.set('valid');
      this.result.set({
        participantName: 'Ana García López',
        projectName: 'Seminario de Investigación 2025',
        type: 'Certificado de Participación',
        issuedAt: '2025-08-01',
      });
    }, 800);
  }
}
