import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-certificate-preview',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatToolbarModule],
  templateUrl: './certificate-preview.component.html',
})
export class CertificatePreviewComponent {
  readonly route = inject(ActivatedRoute);
  readonly certId = signal(this.route.snapshot.paramMap.get('id') ?? '');
}
