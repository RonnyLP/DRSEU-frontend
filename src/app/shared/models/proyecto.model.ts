/**
 * Modelos del Módulo 2 — Gestión de proyectos, alineados a los DTOs del
 * backend certificadosDRSU (`/api/proyectos`).
 */

export type EstadoProyecto = 'BORRADOR' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ANULADO';

/** Elemento de `GET /api/proyectos/lista` (ProyectoDto). */
export interface Proyecto {
  idProyecto: number;
  titulo: string;
  descripcion: string | null;
  numeroRegistro: string | null;
  documentoAprobacion: string | null;
  fechaAprobacion: string | null;
  estado: EstadoProyecto;
  cantidadIntegrantes: number;
}

/** Cuerpo/respuesta de `GET|PUT /api/proyectos/{id}` y `POST /nuevo` (ProyectoInsertDto). */
export interface ProyectoDetalle {
  titulo: string;
  descripcion: string | null;
  numeroRegistro: string | null;
  documentoAprobacion: string | null;
  fechaAprobacion: string | null;
  estado: EstadoProyecto;
  idCreadoPor: number;
  idAprobadoPor: number | null;
}

/** Integrante de un proyecto (IntegranteDto). */
export interface Integrante {
  idParticipacion: number;
  idParticipante: number;
  nombres: string;
  apellidos: string;
  email: string;
  tipoParticipacion: string;
  descripcionParticipante: string | null;
}

export interface IntegranteInsert {
  idParticipante: number;
  tipoParticipacion: string;
  descripcionParticipante?: string | null;
}

export interface ParticipanteSugerencia {
  idParticipante: number;
  nombres: string;
  apellidos: string;
  email: string;
}

export const ESTADOS_PROYECTO: { value: EstadoProyecto; label: string }[] = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'ANULADO', label: 'Anulado' },
];

export function estadoLabel(estado: string): string {
  return ESTADOS_PROYECTO.find((e) => e.value === estado)?.label ?? estado;
}

/** Mapea el estado del backend a las clases de badge ya definidas en styles.css. */
export function estadoBadgeClass(estado: string): string {
  const clases: Record<string, string> = {
    BORRADOR: 'status-draft',
    PENDIENTE: 'status-pending',
    APROBADO: 'status-active',
    RECHAZADO: 'status-failed',
    ANULADO: 'status-closed',
  };
  return `status-badge ${clases[estado] ?? 'status-draft'}`;
}

/** Convierte un Date del datepicker a `yyyy-MM-dd` (LocalDate del backend), sin desfase de zona horaria. */
export function toIsoDate(fecha: Date | null): string | null {
  if (!fecha) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

/** Convierte `yyyy-MM-dd` del backend a Date local para el datepicker. */
export function fromIsoDate(fecha: string | null): Date | null {
  if (!fecha) return null;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}
