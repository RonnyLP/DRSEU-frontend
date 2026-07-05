import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CertificatesService } from '../../../core/services/certificates.service';
import { CertificadoDetalle } from '../../../shared/models/certificate.model';

@Component({
  selector: 'app-certificate-detail',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatSnackBarModule],
  templateUrl: './certificate-detail.component.html',
})
export class CertificateDetailComponent {
  private readonly service = inject(CertificatesService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly certId = signal(+(this.route.snapshot.paramMap.get('id') ?? 0));
  readonly certificate = signal<CertificadoDetalle | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    this.service.getById(this.certId()).subscribe({
      next: (cert) => {
        this.certificate.set(cert);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar el certificado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  download(): void {
    const cert = this.certificate();
    if (!cert) return;
    this.service.downloadBlob(cert.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${cert.codigoCertificado ?? cert.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('No se pudo descargar el PDF', 'Cerrar', { duration: 3000 }),
    });
  }

  estadoLabel(estado: string): string {
    return ({ BORRADOR: 'Borrador', FIRMADO: 'Firmado', pending: 'Pendiente', issued: 'Emitido', revoked: 'Revocado' } as Record<string, string>)[estado] ?? estado;
  }
}
