export type EstadoProyecto = 'BORRADOR' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ANULADO';

export interface ProyectoSearchResult {
  idProyecto: number;
  titulo: string;
  descripcion: string | null;
  estado: EstadoProyecto;
  fechaAprobacion: string | null;
  tipoProyectoNombre: string | null;
  creadoPorUsername: string | null;
}

export interface ProyectoFiltro {
  titulo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoProyecto;
}
