import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectSearchService } from '../project-search.service';
import { EstadoProyecto, ProyectoFiltro } from '../../../shared/models/proyecto-search.model';

const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  ANULADO: 'Anulado',
};

@Component({
  selector: 'app-project-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent {
  private readonly projectSearchService = inject(ProjectSearchService);

  readonly displayedColumns = ['titulo', 'estado', 'fechaAprobacion', 'tipoProyecto', 'creadoPor', 'actions'];
  readonly estados: EstadoProyecto[] = ['BORRADOR', 'PENDIENTE', 'APROBADO', 'RECHAZADO', 'ANULADO'];
  readonly pageSizeOptions = [5, 10, 25];

  readonly tituloFilter = signal('');
  readonly fechaDesde = signal<Date | null>(null);
  readonly fechaHasta = signal<Date | null>(null);
  readonly estadoFilter = signal<EstadoProyecto | ''>('');
  readonly descargando = signal(false);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly filtro = computed<ProyectoFiltro>(() => ({
    titulo: this.tituloFilter().trim() || undefined,
    fechaDesde: this.toIso(this.fechaDesde()),
    fechaHasta: this.toIso(this.fechaHasta()),
    estado: this.estadoFilter() || undefined,
  }));

  readonly resultadosResource = rxResource({
    params: this.filtro,
    stream: ({ params }) => this.projectSearchService.search(params).pipe(debounceTime(300)),
  });

  readonly resultados = computed(() => this.resultadosResource.value() ?? []);

  readonly resultadosPaginados = computed(() => {
    const inicio = this.pageIndex() * this.pageSize();
    return this.resultados().slice(inicio, inicio + this.pageSize());
  });

  private readonly resetPaginaAlFiltrar = effect(() => {
    this.filtro();
    this.pageIndex.set(0);
  });

  readonly sugerenciasResource = rxResource({
    params: this.tituloFilter,
    stream: ({ params }) =>
      params.trim().length >= 2
        ? this.projectSearchService.sugerencias(params.trim()).pipe(debounceTime(300))
        : of([]),
  });

  estadoLabel(estado: string): string {
    return ESTADO_LABELS[estado as EstadoProyecto] ?? estado;
  }

  statusClass(estado: string): string {
    return 'status-' + estado.toLowerCase();
  }

  onTituloInput(event: Event): void {
    this.tituloFilter.set((event.target as HTMLInputElement).value);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  limpiarFiltros(): void {
    this.tituloFilter.set('');
    this.fechaDesde.set(null);
    this.fechaHasta.set(null);
    this.estadoFilter.set('');
  }

  descargarReporte(): void {
    this.descargando.set(true);
    this.projectSearchService.descargarReporte(this.filtro()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'reporte_proyectos.csv';
        enlace.click();
        URL.revokeObjectURL(url);
        this.descargando.set(false);
      },
      error: () => this.descargando.set(false),
    });
  }

  private toIso(fecha: Date | null): string | undefined {
    return fecha ? fecha.toISOString().slice(0, 10) : undefined;
  }
}
