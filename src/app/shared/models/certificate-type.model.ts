export interface CertificateType {
  idTipoCertificado: number;
  nombre: string;
  descripcion: string;
  esPredeterminado: boolean;
  activo: boolean;
  createdAt: string;
}

export interface CertificateTypeInsert {
  nombre: string;
  descripcion: string;
  esPredeterminado: boolean;
}
