export interface IssuanceRequest {
  id: string;
  projectId: string;
  certificateTypeId: string;
  participantIds: string[];
  mode: 'single' | 'bulk';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  generatedCertificateIds: string[];
}
