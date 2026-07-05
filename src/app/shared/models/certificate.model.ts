export interface CertificadoDetalle {
  id: number;
  codigoCertificado: string | null;
  numeroFolio: string | null;
  tipoParticipacion: string | null;
  estadoFirma: string;
  fechaEmision: string | null;
  archivoBorradorPath: string | null;
  archivoFirmadoPath: string | null;
  idParticipante: number;
  participanteNombre: string | null;
  idProyecto: number;
  proyectoTitulo: string | null;
  idTipoCertificado: number;
  tipoCertificadoNombre: string | null;
}

export interface VerificacionCertificado {
  valido: boolean;
  codigoCertificado: string;
  participanteNombre: string;
  proyectoTitulo: string;
  tipoCertificadoNombre: string;
  tipoParticipacion: string | null;
  fechaEmision: string | null;
}

export interface SugerenciaCertificado {
  id: number;
  codigoCertificado: string;
  numeroFolio: string;
  participanteNombre: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CertificateFilterParams {
  participant?: string;
  status?: string;
  code?: string;
  projectId?: number;
  typeId?: number;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  size: number;
}

export interface TemplateField {
  binding: string;
  text?: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
}
