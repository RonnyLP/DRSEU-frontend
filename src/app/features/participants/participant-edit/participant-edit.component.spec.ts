import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { vi } from 'vitest';

import { ParticipantEditComponent } from './participant-edit.component';
import { ParticipantService } from '../../../core/services/participant.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Participant } from '../../../shared/models/participant.model';

const activatedRouteCreateMode = {
  snapshot: {
    paramMap: { get: (_key: string) => null },
  },
};

describe('ParticipantEditComponent — HU-22: Registrar participante', () => {
  let fixture: ComponentFixture<ParticipantEditComponent>;
  let component: ParticipantEditComponent;
  let mockParticipantService: {
    create: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const participanteCreado: Participant = {
    id: 1,
    idParticipante: 1,
    dni: '12345678',
    nombres: 'Ana',
    apellidos: 'Torres',
    nombreCompleto: 'Ana Torres',
    email: 'ana@ejemplo.com',
    celular: null,
    categoria: 'ALUMNO',
    activo: true,
  };

  beforeEach(async () => {
    mockParticipantService = { create: vi.fn(), get: vi.fn() };
    mockSnackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ParticipantEditComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: activatedRouteCreateMode },
        { provide: ParticipantService, useValue: mockParticipantService },
      ],
    }).compileComponents();

    TestBed.overrideComponent(ParticipantEditComponent, {
      add: { providers: [{ provide: MatSnackBar, useValue: mockSnackBar }] },
    });

    fixture = TestBed.createComponent(ParticipantEditComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el título de la página debe ser "Registrar participante" en modo creación', () => {
    expect(component.pageTitle()).toBe('Registrar participante');
  });

  it('el modo edición debe ser falso al registrar', () => {
    expect(component.isEditMode()).toBe(false);
    expect(component.isProjectMode()).toBe(false);
  });

  it('el formulario contiene los campos requeridos por HU-22', () => {
    const controles = component.form.controls;
    expect(controles.nombres).toBeDefined();
    expect(controles.apellidos).toBeDefined();
    expect(controles.dni).toBeDefined();
    expect(controles.categoria).toBeDefined();
    expect(controles.email).toBeDefined();
  });

  it('el formulario inicia inválido porque los campos requeridos están vacíos', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('nombres vacío invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.nombres.setValue('');
    expect(component.form.controls.nombres.invalid).toBe(true);
  });

  it('apellidos vacíos invalidan el formulario', () => {
    llenarFormulario();
    component.form.controls.apellidos.setValue('');
    expect(component.form.controls.apellidos.invalid).toBe(true);
  });

  it('dni vacío invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.dni.setValue('');
    expect(component.form.controls.dni.invalid).toBe(true);
  });

  it('dni con letras invalida el formulario (debe ser solo dígitos)', () => {
    llenarFormulario();
    component.form.controls.dni.setValue('ABCD1234');
    expect(component.form.controls.dni.invalid).toBe(true);
  });

  it('dni con menos de 8 dígitos invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.dni.setValue('1234567');
    expect(component.form.controls.dni.invalid).toBe(true);
  });

  it('email con formato inválido invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.email.setValue('no-es-un-email');
    expect(component.form.controls.email.invalid).toBe(true);
  });

  it('email sin dominio invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.email.setValue('usuario@');
    expect(component.form.controls.email.invalid).toBe(true);
  });

  it('categoria vacía invalida el formulario', () => {
    llenarFormulario();
    component.form.controls.categoria.setValue('' as never);
    expect(component.form.controls.categoria.invalid).toBe(true);
  });

  it('formulario completo con todos los campos requeridos es válido', () => {
    llenarFormulario();
    expect(component.form.valid).toBe(true);
  });

  it('onSubmit no llama al servicio si el formulario es inválido', () => {
    component.onSubmit();
    expect(mockParticipantService.create).not.toHaveBeenCalled();
  });

  it('la categoría acepta los valores de HU-22: Alumno, Docente, Externo, Administrativo', () => {
    const categorias = component.categoryOptions.map((c) => c.value);
    expect(categorias).toContain('ALUMNO');
    expect(categorias).toContain('DOCENTE');
    expect(categorias).toContain('EXTERNO');
    expect(categorias).toContain('ADMINISTRATIVO');
  });

  it('registro exitoso muestra snackbar de confirmación', () => {
    mockParticipantService.create.mockReturnValue(of(participanteCreado));

    llenarFormulario();
    component.onSubmit();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Participante guardado correctamente',
      'Cerrar',
      { duration: 3000 }
    );
  });

  it('registro exitoso redirige a /participants', () => {
    mockParticipantService.create.mockReturnValue(of(participanteCreado));
    const navigateSpy = vi.spyOn(router, 'navigate');

    llenarFormulario();
    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/participants']);
  });

  it('registro exitoso llama a create con los datos del formulario', () => {
    mockParticipantService.create.mockReturnValue(of(participanteCreado));

    llenarFormulario();
    component.onSubmit();

    const payload = mockParticipantService.create.mock.calls[0][0];
    expect(payload.nombres).toBe('Ana');
    expect(payload.apellidos).toBe('Torres');
    expect(payload.dni).toBe('12345678');
    expect(payload.email).toBe('ana@ejemplo.com');
    expect(payload.categoria).toBe('ALUMNO');
  });

  it('error por DNI duplicado muestra el mensaje de error del servidor', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'Ya existe un participante con ese DNI',
      status: 400,
    });
    mockParticipantService.create.mockReturnValue(throwError(() => errorResponse));

    llenarFormulario();
    component.onSubmit();

    expect(component.errorMessage()).toBe('Ya existe un participante con ese DNI');
  });

  it('error por correo duplicado muestra el mensaje de error del servidor', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'Ya existe otro participante con ese correo electrónico',
      status: 400,
    });
    mockParticipantService.create.mockReturnValue(throwError(() => errorResponse));

    llenarFormulario();
    component.onSubmit();

    expect(component.errorMessage()).toBe('Ya existe otro participante con ese correo electrónico');
  });

  it('error genérico muestra mensaje de fallback', () => {
    mockParticipantService.create.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    llenarFormulario();
    component.onSubmit();

    expect(component.errorMessage()).toBe('No se pudo guardar el participante.');
  });

  it('error desactiva el estado de guardando', () => {
    mockParticipantService.create.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: 'Error', status: 400 }))
    );

    llenarFormulario();
    component.onSubmit();

    expect(component.saving()).toBe(false);
  });

  function llenarFormulario(): void {
    component.form.setValue({
      nombres: 'Ana',
      apellidos: 'Torres',
      dni: '12345678',
      email: 'ana@ejemplo.com',
      celular: '',
      categoria: 'ALUMNO',
      tipoParticipacion: '',
      descripcionParticipante: '',
    });
  }
});
