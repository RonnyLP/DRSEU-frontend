import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { authRoutes } from './features/auth/auth.routes';
import { ShellComponent } from './layout/shell.component';
import { ProjectListComponent } from './features/projects/project-list/project-list.component';
import { ProjectNewComponent } from './features/projects/project-new/project-new.component';
import { ProjectDetailComponent } from './features/projects/project-detail/project-detail.component';
import { ProjectEditComponent } from './features/projects/project-edit/project-edit.component';
import { ParticipantListComponent } from './features/participants/participant-list/participant-list.component';
import { ParticipantEditComponent } from './features/participants/participant-edit/participant-edit.component';
import { CertificateEditorComponent } from './features/certificate-editor/certificate-editor.component';
import { IssuanceNewComponent } from './features/issuance/issuance-new/issuance-new.component';
import { IssuanceListComponent } from './features/issuance/issuance-list/issuance-list.component';
import { IssuanceDetailComponent } from './features/issuance/issuance-detail/issuance-detail.component';
import { CertificateListComponent } from './features/certificates/certificate-list/certificate-list.component';
import { CertificateDetailComponent } from './features/certificates/certificate-detail/certificate-detail.component';
import { CertificatePreviewComponent } from './features/certificates/certificate-preview/certificate-preview.component';
import { CertificateTypeListComponent } from './features/certificate-types/certificate-type-list/certificate-type-list.component';
import { VerifyComponent } from './features/certificates/verify/verify.component';

export const routes: Routes = [
  { path: 'auth', children: authRoutes },
  { path: 'verify/:code', component: VerifyComponent },
  {
    path: '',
    canActivate: [authGuard],
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },

      // Proyectos
      { path: 'projects', component: ProjectListComponent },
      { path: 'projects/new', component: ProjectNewComponent },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: 'projects/:id/edit', component: ProjectEditComponent },

      // Participantes
      { path: 'participants', component: ParticipantListComponent },
      { path: 'participants/new', component: ParticipantEditComponent },
      { path: 'participants/:pid/edit', component: ParticipantEditComponent },
      { path: 'projects/:id/participants', component: ParticipantListComponent },
      { path: 'projects/:id/participants/new', component: ParticipantEditComponent },
      { path: 'projects/:id/participants/:pid/edit', component: ParticipantEditComponent },

      // Editor de plantilla)
      { path: 'projects/:id/template', component: CertificateEditorComponent },

      // Solicitud de emisión
      { path: 'projects/:id/issuance/new', component: IssuanceNewComponent },
      { path: 'issuance-requests', component: IssuanceListComponent },
      { path: 'issuance-requests/:rid', component: IssuanceDetailComponent },

      // Certificados
      { path: 'certificates', component: CertificateListComponent },
      { path: 'certificates/:id', component: CertificateDetailComponent },
      { path: 'certificates/:id/preview', component: CertificatePreviewComponent },

      // Catálogo
      { path: 'certificate-types', component: CertificateTypeListComponent },
    ],
  },
  { path: '**', redirectTo: 'projects' },
];
