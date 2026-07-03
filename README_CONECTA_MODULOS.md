# README_CONECTA_MODULOS — Frontend

Guía para incorporar nuevos módulos al frontend Angular sin romper lo que ya está implementado.

---

## Estado actual

El módulo de autenticación (HU-01..05) está completamente implementado. Incluye login, recuperación de contraseña, cambio de contraseña, guard de rutas e interceptor HTTP. Los módulos nuevos se conectan a esta infraestructura sin reemplazarla.

---

## Arquitectura base (Angular 21+)

- **Componentes standalone** — sin `NgModules`. No usar `@NgModule`.
- **Signals** para estado reactivo — no usar `BehaviorSubject` ni `async pipe` para estado global.
- **`inject()`** en lugar de constructor injection siempre que sea posible.
- **Control flow nativo**: `@if`, `@for`, `@switch` — no usar `*ngIf`, `*ngFor`.
- **Reactive Forms** (`FormBuilder`, `FormGroup`) — no usar Template Driven Forms para formularios complejos.
- **Sin lazy loading** — todos los módulos se importan directamente en el array `routes`.

---

## URL del backend

Definida en `src/environments/environment.ts`. **Nunca hardcodear URLs** de API en los servicios.

```ts
// environment.ts (desarrollo)
export const environment = { production: false, apiUrl: 'http://localhost:8080' };

// environment.prod.ts (producción)
export const environment = { production: true, apiUrl: '' }; // completar antes de deploy
```

Si un servicio nuevo necesita la URL del backend:
```ts
import { environment } from '../../../environments/environment';
const API = `${environment.apiUrl}/tu-recurso`;
```

---

## Archivos que NO debes modificar

Estos archivos pertenecen al módulo Auth. Modificarlos puede romper el login, la sesión o la protección de rutas.

| Archivo | Razón |
|---|---|
| `src/app/core/services/auth.service.ts` | Gestión de sesión, señales de estado, todos los calls de auth |
| `src/app/core/interceptors/auth.interceptor.ts` | Inyecta `Authorization: Bearer <token>` en cada request |
| `src/app/core/guards/auth.guard.ts` | Redirige a `/auth/login` si no hay sesión activa |
| `src/app/features/auth/login/` | Componente de login (username + password) |
| `src/app/features/auth/recover-password/` | Componente de recuperación de contraseña |
| `src/app/features/auth/reset-password/` | Componente de reset de contraseña por token |
| `src/app/features/auth/change-password/` | Componente de cambio de contraseña autenticado |
| `src/app/shell/` | Shell principal con navbar, logout, username display |

---

## Archivos que SÍ necesitan merge al agregar módulos

### `src/app/app.routes.ts` ⚠️ CRÍTICO

Agrega rutas nuevas **después** del bloque de rutas de auth y dentro del componente `shell`. No reemplaces el archivo completo.

Estructura esperada:
```ts
export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Rutas de auth — NO TOCAR ESTE BLOQUE
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'recover-password', component: RecoverPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ],
  },

  // Shell con guard — agregar tus rutas aquí dentro
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // { path: 'certificados', component: CertificadosComponent },
      // { path: 'reportes', component: ReportesComponent },
      // ← AQUÍ agrega rutas de nuevos módulos
    ],
  },

  // Rutas de auth desde dentro del shell — NO TOCAR
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'auth/change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
    ],
  },
];
```

---

### `src/app/app.config.ts`

Agrega providers nuevos al array `providers` sin borrar los existentes. Los providers actuales son obligatorios:

```ts
providers: [
  provideBrowserGlobalErrorListeners(),  // NO TOCAR
  provideRouter(routes),                  // NO TOCAR
  provideAnimationsAsync(),               // NO TOCAR
  provideHttpClient(withInterceptors([authInterceptor])), // NO TOCAR — el interceptor está aquí
  provideAppInitializer(() => inject(AuthService).init()), // NO TOCAR — carga sesión al inicio

  // ← Agrega tus providers adicionales aquí (ej: provideNativeDateAdapter())
]
```

---

### `src/app/shell/shell.component.html`

Si necesitas agregar links de navegación al menú principal, edita este template. Usa el `currentUser()` signal de `AuthService` para mostrar/ocultar opciones según el rol:

```html
@if (authService.currentUser()?.rol === 'ADMIN') {
  <a mat-list-item routerLink="/admin/usuarios">Usuarios</a>
}
```

---

## Cómo agregar un módulo nuevo (checklist)

- [ ] Crear la carpeta en `src/app/features/nombre-modulo/`
- [ ] Crear componentes standalone con su `.ts` y `.html`
- [ ] Crear el servicio en `src/app/core/services/nombre-modulo.service.ts` (inyectar `HttpClient` con `inject()`)
- [ ] Agregar rutas en `app.routes.ts` dentro del bloque del `ShellComponent` con `canActivate: [authGuard]`
- [ ] Importar Angular Material en el componente donde se use (no existe un módulo compartido global)
- [ ] Si necesitas datos del usuario autenticado: inyectar `AuthService` y leer `authService.currentUser()`

---

## Token JWT — cómo funciona en el frontend

El token se guarda en `localStorage` con la clave `drseu_token`.  
El `authInterceptor` lo inyecta automáticamente en **todos** los requests HTTP salientes.  
No necesitas agregar el header `Authorization` manualmente en ningún servicio.

Si el backend devuelve `401`, el interceptor no hace nada por defecto — si necesitas manejo de `401` global (redirect al login), agrégalo al interceptor después de coordinar con el equipo.

---

## Estado global de sesión

`AuthService` expone dos signals:
- `currentUser: Signal<UserProfile | null>` — datos del usuario logueado (`{ id, username, rol }`)
- `token: Signal<string | null>` — el JWT actual

Para leer el rol en cualquier componente:
```ts
private auth = inject(AuthService);
// en template:
// @if (auth.currentUser()?.rol === 'ADMIN') { ... }
```

---

## Convenciones de código

- Nombre de archivos: `kebab-case.component.ts`, `kebab-case.service.ts`
- Nombre de clases: `PascalCase`
- Signals: declarar con `signal<Tipo>(valorInicial)` como campo de clase, no en el constructor
- `inject()` siempre como inicializador de campo privado, no en el constructor
- Formularios: usar `fb.nonNullable.group({...})` para campos que nunca serán null
- Material: importar cada componente `MatXxxModule` individualmente en el array `imports` del componente

---

## Roles disponibles (referencia)

Los mismos que el backend: `ADMIN`, `DOCENTE`, `ESTUDIANTE`, `SUPERVISOR`.  
Se obtienen del JWT via `GET /auth/me` al iniciar la app. El valor está en `auth.currentUser()?.rol`.
