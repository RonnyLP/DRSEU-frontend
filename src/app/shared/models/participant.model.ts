export type ParticipantCategory =
  | 'DOCENTE'
  | 'ALUMNO'
  | 'ESTUDIANTE'
  | 'EXTERNO'
  | 'ADMINISTRATIVO'
  | 'COORDINADOR'
  | 'ORGANIZADOR'
  | 'PONENTE'
  | 'COLABORADOR'
  | 'PARTICIPANTE'
  | 'VOLUNTARIO';

export interface Participant {
  id: number;
  idParticipante: number;
  dni: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  celular: string | null;
  categoria: ParticipantCategory;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParticipantPayload {
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  categoria: ParticipantCategory;
  activo: boolean;
}

export interface ProjectParticipant extends Participant {
  participacionId: number;
  idProyecto: number;
  tipoParticipacion: string;
  descripcionParticipante: string | null;
}

export interface ProjectParticipantPayload extends ParticipantPayload {
  idParticipante?: number;
  tipoParticipacion: string;
  descripcionParticipante: string | null;
}
