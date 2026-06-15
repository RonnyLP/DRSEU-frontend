import { Component, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

interface CertificateType {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-certificate-type-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule, MatDialogModule],
  templateUrl: './certificate-type-list.component.html',
})
export class CertificateTypeListComponent {
  readonly displayedColumns = ['name', 'description', 'actions'];

  readonly certificateTypes = signal<CertificateType[]>([
    { id: '1', name: 'Certificado de Participación', description: 'Emitido a todos los asistentes del evento' },
    { id: '2', name: 'Certificado de Ponente', description: 'Emitido a expositores y ponentes' },
    { id: '3', name: 'Certificado de Organizador', description: 'Emitido al equipo organizador' },
    { id: '4', name: 'Certificado de Mérito', description: 'Reconocimiento por desempeño destacado' },
  ]);
}
