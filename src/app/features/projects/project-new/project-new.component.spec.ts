import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProjectNewComponent } from './project-new.component';
import { ProjectService } from '../../../core/services/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProyectoDetalle } from '../../../shared/models/proyecto.model';

describe('ProjectNewComponent — HU-17: Crear nuevo proyecto', () => {
  let fixture: ComponentFixture<ProjectNewComponent>;
  let component: ProjectNewComponent;
  let mockProjectService: { create: ReturnType<typeof vi.fn> };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const proyectoCreado: ProyectoDetalle = {
    titulo: 'Seminario Test',
    tipoEvento: 'Seminario',
    modalidad: 'Presencial',
    fechaInicio: '2026-08-01',
    fechaFin: '2026-08-05',
    descripcion: null,
    numeroRegistro: null,
    documentoAprobacion: null,
    fechaAprobacion: null,
    estado: 'EN_PROCESO',
    idCreadoPor: 1,
    idAprobadoPor: null,
  };

  beforeEach(async () => {
    mockProjectService = { create: vi.fn() };
    mockSnackBar = { open: vi.fn() };

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('1'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    await TestBed.configureTestingModule({
      imports: [ProjectNewComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ProjectService, useValue: mockProjectService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectNewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe tener los campos requeridos por HU-17', () => {
    const controles = component.form.controls;
    expect(controles.titulo).toBeDefined();
    expect(controles.tipoEvento).toBeDefined();
    expect(controles.modalidad).toBeDefined();
    expect(controles.fechaInicio).toBeDefined();
    expect(controles.fechaFin).toBeDefined();
  });

  it('el estado inicial del formulario debe ser EN_PROCESO', () => {
    expect(component.form.controls.estado.value).toBe('EN_PROCESO');
  });

  it('el formulario inicia inválido porque los campos requeridos están vacíos', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('titulo vacío invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.titulo.setValue('');
    expect(component.form.controls.titulo.invalid).toBe(true);
  });

  it('tipoEvento vacío invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.tipoEvento.setValue('');
    expect(component.form.controls.tipoEvento.invalid).toBe(true);
  });

  it('modalidad vacía invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.modalidad.setValue('');
    expect(component.form.controls.modalidad.invalid).toBe(true);
  });

  it('fechaInicio nula invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.fechaInicio.setValue(null);
    expect(component.form.controls.fechaInicio.invalid).toBe(true);
  });

  it('fechaFin nula invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.fechaFin.setValue(null);
    expect(component.form.controls.fechaFin.invalid).toBe(true);
  });

  it('formulario completo con todos los campos requeridos es válido', () => {
    llenarFormulario();
    expect(component.form.valid).toBe(true);
  });

  it('onSubmit no llama al servicio si el formulario es inválido', () => {
    component.onSubmit();
    expect(mockProjectService.create).not.toHaveBeenCalled();
  });

  it('creación exitosa muestra snackbar de confirmación y redirige a /projects', () => {
    mockProjectService.create.mockReturnValue(of(proyectoCreado));
    const navigateSpy = vi.spyOn(router, 'navigate');

    llenarFormulario();
    component.onSubmit();

    expect(mockProjectService.create).toHaveBeenCalledOnce();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Proyecto creado correctamente',
      'Cerrar',
      { duration: 3000 }
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/projects']);
  });

  it('el proyecto enviado al servicio tiene estado EN_PROCESO', () => {
    mockProjectService.create.mockReturnValue(of(proyectoCreado));

    llenarFormulario();
    component.onSubmit();

    const argumento: ProyectoDetalle = mockProjectService.create.mock.calls[0][0];
    expect(argumento.estado).toBe('EN_PROCESO');
  });

  it('el proyecto enviado incluye tipoEvento, modalidad, fechaInicio y fechaFin', () => {
    mockProjectService.create.mockReturnValue(of(proyectoCreado));

    llenarFormulario();
    component.onSubmit();

    const argumento: ProyectoDetalle = mockProjectService.create.mock.calls[0][0];
    expect(argumento.titulo).toBe('Seminario de Investigación 2026');
    expect(argumento.tipoEvento).toBe('Seminario');
    expect(argumento.modalidad).toBe('Presencial');
    expect(argumento.fechaInicio).toBe('2026-08-01');
    expect(argumento.fechaFin).toBe('2026-08-05');
  });

  it('error en creación muestra mensaje de error y desactiva el estado de guardando', () => {
    mockProjectService.create.mockReturnValue(
      throwError(() => ({ error: 'No se pudo crear el proyecto' }))
    );

    llenarFormulario();
    component.onSubmit();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'No se pudo crear el proyecto',
      'Cerrar',
      { duration: 5000 }
    );
    expect(component.guardando()).toBe(false);
  });

  function llenarFormulario(): void {
    component.form.setValue({
      titulo: 'Seminario de Investigación 2026',
      tipoEvento: 'Seminario',
      modalidad: 'Presencial',
      fechaInicio: new Date(2026, 7, 1),
      fechaFin: new Date(2026, 7, 5),
      descripcion: '',
      numeroRegistro: '',
      documentoAprobacion: '',
      fechaAprobacion: null,
      estado: 'EN_PROCESO',
    });
  }
});
