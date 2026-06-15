import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';

interface TemplateField {
  id: string;
  binding: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
}

const AVAILABLE_BINDINGS = [
  { binding: 'participant.fullName', label: 'Nombre del participante' },
  { binding: 'participation.type', label: 'Tipo de participación' },
  { binding: 'project.name', label: 'Nombre del proyecto' },
  { binding: 'certificate.issuedAt', label: 'Fecha de emisión' },
  { binding: 'static', label: 'Texto estático' },
];

@Component({
  selector: 'app-certificate-editor',
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSliderModule, MatDividerModule, MatTooltipModule, MatListModule],
  templateUrl: './certificate-editor.component.html',
})
export class CertificateEditorComponent {
  readonly route = inject(ActivatedRoute);
  readonly projectId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly availableBindings = AVAILABLE_BINDINGS;

  readonly fields = signal<TemplateField[]>([
    { id: '1', binding: 'participant.fullName', label: 'Nombre del participante', x: 0.5, y: 0.45, fontSize: 28, fontFamily: 'Helvetica', color: '#1a237e', align: 'center' },
    { id: '2', binding: 'participation.type', label: 'Tipo de participación', x: 0.5, y: 0.55, fontSize: 18, fontFamily: 'Helvetica', color: '#424242', align: 'center' },
  ]);

  readonly selectedFieldId = signal<string | null>(null);

  readonly selectedField = computed(() =>
    this.fields().find(f => f.id === this.selectedFieldId()) ?? null
  );

  readonly fontSizeControl = new FormControl(28);
  readonly colorControl = new FormControl('#1a237e');
  readonly alignControl = new FormControl<'left' | 'center' | 'right'>('center');
  readonly staticTextControl = new FormControl('');

  selectField(id: string): void {
    this.selectedFieldId.set(id);
    const field = this.fields().find(f => f.id === id);
    if (field) {
      this.fontSizeControl.setValue(field.fontSize);
      this.colorControl.setValue(field.color);
      this.alignControl.setValue(field.align);
    }
  }

  addField(binding: string, label: string): void {
    const id = Date.now().toString();
    this.fields.update(fields => [...fields, {
      id, binding, label, x: 0.5, y: 0.5,
      fontSize: 18, fontFamily: 'Helvetica', color: '#212121', align: 'center',
    }]);
    this.selectField(id);
  }

  removeField(id: string): void {
    this.fields.update(fields => fields.filter(f => f.id !== id));
    if (this.selectedFieldId() === id) this.selectedFieldId.set(null);
  }

  onSave(): void {
    // TODO: PUT /projects/:id/template
  }
}
