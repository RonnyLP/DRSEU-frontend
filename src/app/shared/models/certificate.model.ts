export interface Certificate {
  id: string;
  code: string;
  participantId: string;
  projectId: string;
  certificateTypeId: string;
  status: 'pending' | 'issued' | 'revoked';
  issuedAt: string;
  pdfUrl: string;
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
