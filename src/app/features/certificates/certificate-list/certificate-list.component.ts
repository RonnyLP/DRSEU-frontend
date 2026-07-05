import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CertificatesService } from '../../../core/services/certificates.service';
import { CertificadoDetalle, CertificateFilterParams, PageResponse } from '../../../shared/models/certificate.model';

interface ActiveChip {
  key: string;
  label: string;
}

@Component({
  selector: 'app-certificate-list',
  imports: [
    RouterLink,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatCardModule,
    MatTooltipModule, MatChipsModule, MatSnackBarModule,
  ],
  templateUrl: './certificate-list.component.html',
})
export class CertificateListComponent {
  private readonly service = inject(CertificatesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly participantFilter = signal('');
  readonly statusFilter = signal('');
  readonly codeFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  private readonly filterParams = computed<CertificateFilterParams>(() => ({
    participant: this.participantFilter() || undefined,
    status: this.statusFilter() || undefined,
    code: this.codeFilter() || undefined,
    page: this.pageIndex(),
    size: this.pageSize(),
  }));

  readonly result = toSignal(
    toObservable(this.filterParams).pipe(
      debounceTime(300),
      switchMap((params) => this.service.list(params)),
    ),
  );

  readonly certificates = computed(() => this.result()?.content ?? []);
  readonly totalElements = computed(() => this.result()?.totalElements ?? 0);

  readonly activeChips = computed<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (this.participantFilter()) chips.push({ key: 'participant', label: `Participante: ${this.participantFilter()}` });
    if (this.statusFilter()) chips.push({ key: 'status', label: `Estado: ${this.statusLabel(this.statusFilter())}` });
    if (this.codeFilter()) chips.push({ key: 'code', label: `Código: ${this.codeFilter()}` });
    return chips;
  });

  readonly displayedColumns = ['codigoCertificado', 'participanteNombre', 'proyectoTitulo', 'tipoCertificadoNombre', 'estadoFirma', 'fechaEmision', 'actions'];

  constructor() {
    const qp = this.route.snapshot.queryParams;
    if (qp['participant']) this.participantFilter.set(qp['participant']);
    if (qp['status'])      this.statusFilter.set(qp['status']);
    if (qp['code'])        this.codeFilter.set(qp['code']);

    effect(() => {
      const params: Params = {};
      if (this.participantFilter()) params['participant'] = this.participantFilter();
      if (this.statusFilter())      params['status']      = this.statusFilter();
      if (this.codeFilter())        params['code']        = this.codeFilter();
      this.router.navigate([], { queryParams: params, replaceUrl: true });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  removeChip(key: string): void {
    if (key === 'participant') this.participantFilter.set('');
    if (key === 'status')      this.statusFilter.set('');
    if (key === 'code')        this.codeFilter.set('');
    this.pageIndex.set(0);
  }

  download(cert: CertificadoDetalle): void {
    this.service.downloadBlob(cert.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${cert.codigoCertificado}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('No se pudo descargar el certificado', 'Cerrar', { duration: 3000 }),
    });
  }

  statusLabel(status: string): string {
    return ({ pending: 'Pendiente', issued: 'Emitido', revoked: 'Revocado', BORRADOR: 'Borrador', FIRMADO: 'Firmado' } as Record<string, string>)[status] ?? status;
  }
}
