import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CertificatesService } from '../../../core/services/certificates.service';

@Component({
  selector: 'app-certificate-preview',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatToolbarModule, MatSnackBarModule],
  templateUrl: './certificate-preview.component.html',
})
export class CertificatePreviewComponent {
  private readonly service = inject(CertificatesService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly snackBar = inject(MatSnackBar);

  readonly certId = signal(+(this.route.snapshot.paramMap.get('id') ?? 0));
  readonly safePdfUrl = signal<SafeResourceUrl | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  private blobUrl: string | null = null;

  constructor() {
    this.service.previewBlob(this.certId()).subscribe({
      next: (blob) => {
        this.blobUrl = URL.createObjectURL(blob);
        this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        this.snackBar.open('No hay PDF disponible para este certificado', 'Cerrar', { duration: 4000 });
      },
    });
  }

  download(): void {
    this.service.downloadBlob(this.certId()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${this.certId()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('No se pudo descargar el PDF', 'Cerrar', { duration: 3000 }),
    });
  }

  ngOnDestroy(): void {
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
  }
}
