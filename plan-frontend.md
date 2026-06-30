# Plan de Frontend — Sistema de Generación y Gestión de Certificados

Sistema para eventos y proyectos **universitarios**: autenticación, gestión de proyectos con sus participantes, un editor que toma una plantilla PDF, reconoce su texto y coloca campos dinámicos (nombre, tipo de participación, etc.), un flujo de **solicitud de emisión** (unitaria o en masa) y una **búsqueda transversal de certificados** con verificación pública.

> **Stack base:** Angular 21+ (standalone components, signals, zoneless por defecto, control flow `@if/@for`) + Angular Material. Angular 22 (signal-first, Signal Forms estable) llega a mediados de 2026; el plan es compatible con ambos.

---

## 1. Librerías

### Núcleo
- `@angular/core` 21+ — standalone, zoneless, signals.
- `@angular/material` + `@angular/cdk` — UI. Clave aquí: **CDK Drag & Drop** (editor), **CDK Overlay** (sugerencias/autocomplete), **`SelectionModel`** de `@angular/cdk/collections` (selección múltiple para emisión en masa).
- `@angular/router` — lazy loading por feature.

### Estado y datos
- **Signals + servicios** como base.
- **`@ngrx/signals` (SignalStore)** para entidades compartidas (sesión, proyecto actual, participantes) sin el boilerplate de NgRx clásico.
- **`httpResource` / `rxResource`** (nativos de Angular 19+) para los GET reactivos atados a filtros.

### Dominio del certificado
- **`pdfjs-dist`** o **`ngx-extended-pdf-viewer`** — renderizar la plantilla PDF como fondo del editor y para previsualizar.
- **`konva` + `ng2-konva`** (o `fabric.js`) — capa de canvas sobre el PDF para colocar, arrastrar y estilizar campos con precisión y coordenadas exactas.
- **`pdf-lib`** — solo si se fusionan datos del lado del cliente. **Recomendado:** que la generación final del PDF la haga el backend (consistencia de fuentes y rendimiento).

### Utilitarias
- `date-fns` — rangos de fecha.
- `@angular/material/datepicker` (con `provideNativeDateAdapter` o adapter de date-fns).
- `mat-stepper` — wizard de emisión.
- `mat-chip-grid` / `mat-autocomplete` — filtros combinables.
- Interceptor JWT propio (o `@auth0/angular-jwt`) para el token.

---

## 2. Modelo de dominio

```ts
interface Project {
  id; name; description;
  startDate; endDate;
  status: 'draft' | 'active' | 'closed';
}

interface Participant {
  id; projectId;
  fullName; dni; email;
  participationType;          // tipo de participación asignado (HU-20)
  certificateTypeId;
}

interface CertificateType {   // HU-18
  id; name; description;
}

interface TemplateField {     // configuración del editor (HU-21, HU-29)
  binding: string;            // 'participant.fullName' | 'participation.type' | 'static'
  text?: string;              // solo para campos estáticos
  x; y;                       // coordenadas normalizadas
  fontSize; fontFamily; color;
  align: 'left' | 'center' | 'right';
}

interface Certificate {       // resultado emitido, buscable
  id; code;                   // folio único / verificable
  participantId; projectId; certificateTypeId;
  status: 'pending' | 'issued' | 'revoked';
  issuedAt; pdfUrl;
}

interface IssuanceRequest {   // solicitud de emisión
  id; projectId; certificateTypeId;
  participantIds: string[];   // 1 = unitaria, N = masa
  mode: 'single' | 'bulk';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt; generatedCertificateIds: string[];
}
```

---

## 3. Rutas

```ts
// app.routes.ts
[
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },

  // Ruta pública de verificación (fuera del authGuard)
  { path: 'verify/:code', loadComponent: ... },        // valida certificado por folio

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component'),  // toolbar + sidenav
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },

      // ── Proyectos (HU-06..17) ──
      { path: 'projects', loadComponent: ... },              // landing = búsqueda por nombre + filtros
      { path: 'projects/new', loadComponent: ... },          // HU-17
      { path: 'projects/:id', loadComponent: ... },          // detalle: HU-12,13,16
      { path: 'projects/:id/edit', loadComponent: ... },

      // ── Participantes (HU-19..25) ──
      { path: 'projects/:id/participants', loadComponent: ... },
      { path: 'projects/:id/participants/:pid/edit', loadComponent: ... },

      // ── Editor de plantilla (HU-26..29, 21) ──
      { path: 'projects/:id/template', loadComponent: ... },

      // ── Solicitud de emisión (unitaria o en masa) ──
      { path: 'projects/:id/issuance/new', loadComponent: ... },   // wizard
      { path: 'issuance-requests', loadComponent: ... },           // bandeja/seguimiento
      { path: 'issuance-requests/:rid', loadComponent: ... },      // detalle + estado

      // ── Búsqueda de certificados (transversal) ──
      { path: 'certificates', loadComponent: ... },                // filtros
      { path: 'certificates/:id', loadComponent: ... },            // ficha (HU-14)
      { path: 'certificates/:id/preview', loadComponent: ... },    // vista previa dedicada

      // ── Catálogo ──
      { path: 'certificate-types', loadComponent: ... },           // HU-18 CRUD
    ]
  }
]
```

```ts
// auth.routes.ts
[
  { path: 'login', ... },              // HU-01
  { path: 'recover-password', ... },   // HU-03 (solicitud)
  { path: 'reset-password', ... },     // HU-03 (con token del email)
  { path: 'register', ... },           // HU-04 (probablemente solo admin)
  { path: 'change-password', ... },    // HU-05
]
```

**Notas:**
- HU-02 (cierre de sesión) es una **acción**, no una ruta: botón en la toolbar → limpia token → `router.navigate(['/auth/login'])`.
- La página de vista previa acepta **dos fuentes**: un certificado ya emitido (`certificates/:id/preview`) o un preview *en borrador* dentro del wizard (con un participante de muestra). Mismo componente, distinta fuente de datos vía `input`.

---

## 4. Estructura de carpetas

```
src/app/
├── core/                    # singletons: interceptors, guards, auth, api base
│   ├── interceptors/        # auth.interceptor, error.interceptor
│   ├── guards/              # auth.guard, role.guard
│   └── services/            # auth, token, notification
├── shared/
│   ├── ui/                  # tablas, filtros, confirm-dialog
│   ├── models/              # Project, Participant, CertificateType, etc.
│   └── certificate-preview/ # componente reutilizable (borrador/emitido, público/privado)
├── layout/                  # shell: toolbar + sidenav
├── features/
│   ├── auth/                # HU-01..05
│   ├── projects/            # HU-06..17 (incluye landing de búsqueda por nombre)
│   ├── participants/        # HU-19..25
│   ├── certificate-types/   # HU-18
│   ├── certificate-editor/  # HU-26..29, 21
│   ├── certificates/        # búsqueda + ficha + vista previa
│   └── issuance/            # wizard + bandeja + detalle de solicitud
└── app.routes.ts
```

---

## 5. Interacciones con la API

> Asume REST + JWT. La generación de PDFs y el OCR se hacen en el backend; el front envía configuración/coordenadas y muestra resultados.

### Auth (HU-01..05)
| Método | Endpoint | HU | Notas |
|---|---|---|---|
| POST | `/auth/login` | HU-01 | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | — | refresco de token |
| POST | `/auth/logout` | HU-02 | |
| POST | `/auth/recover-password` | HU-03 | `{ email }` → dispara correo |
| POST | `/auth/reset-password` | HU-03 | `{ token, newPassword }` |
| POST | `/auth/change-password` | HU-05 | `{ currentPassword, newPassword }` |
| POST | `/users` | HU-04 | crear usuario (admin) |
| GET | `/auth/me` | — | hidratar sesión al recargar |

### Proyectos y filtros (HU-06..11, 16, 17)
| Método | Endpoint | HU | Notas |
|---|---|---|---|
| GET | `/projects?name=&person=&dateFrom=&dateTo=&status=&sort=&page=&size=` | HU-06..10 | un solo endpoint con todos los filtros como query params |
| GET | `/projects/suggestions?q=` | HU-11 | autocompletado (`mat-autocomplete`) |
| POST | `/projects` | HU-17 | |
| GET | `/projects/:id` | — | |
| PUT / DELETE | `/projects/:id` | — | |
| GET | `/projects/:id/report` | HU-16 | descarga blob (Excel/PDF) |

### Participantes (HU-12,13,19,20,22..25)
| Método | Endpoint | HU | Notas |
|---|---|---|---|
| GET | `/projects/:id/participants?sort=name` | HU-12,13 | orden server-side o `MatTableDataSource.sort` |
| POST | `/projects/:id/participants` | HU-22,19 | |
| POST | `/projects/:id/participants/bulk` | HU-19 | carga masiva |
| GET | `/projects/:id/participants/:pid` | HU-25 | |
| PUT | `/projects/:id/participants/:pid` | HU-23 | |
| DELETE | `/projects/:id/participants/:pid` | HU-24 | confirm-dialog antes |
| PUT | `/projects/:id/participants/:pid/participation-type` | HU-20 | `{ certificateTypeId }` |

### Tipos de certificado (HU-18)
| Método | Endpoint |
|---|---|
| GET / POST | `/certificate-types` |
| PUT / DELETE | `/certificate-types/:id` |

### Editor y plantilla (HU-26..29, 21)
| Método | Endpoint | HU | Notas |
|---|---|---|---|
| POST | `/projects/:id/template` | HU-26 | multipart con el PDF → `{ templateId, pageImageUrl, dimensions }` |
| POST | `/projects/:id/template/ocr` | HU-27 | backend hace OCR → `{ blocks: [{ text, x, y, w, h }] }` |
| PUT | `/projects/:id/template` | HU-21,29 | guarda `description` + `fields[]` |

```jsonc
// PUT /projects/:id/template
{
  "description": "texto fijo del certificado",
  "fields": [
    { "binding": "participant.fullName", "x": 300, "y": 240,
      "fontSize": 28, "fontFamily": "Helvetica", "color": "#222", "align": "center" },
    { "binding": "participation.type", "x": 300, "y": 300, "fontSize": 18, "align": "center" },
    { "binding": "static", "text": "Lima, 2026", "x": 80, "y": 500, "fontSize": 14, "align": "left" }
  ]
}
```

### Solicitud de emisión (unitaria o en masa)
| Método | Endpoint | Notas |
|---|---|---|
| POST | `/issuance-requests` | `{ projectId, certificateTypeId, participantIds, mode }`; generación **asíncrona** → `{ id, status: 'queued' }` |
| GET | `/issuance-requests?projectId=&status=` | bandeja de seguimiento |
| GET | `/issuance-requests/:rid` | estado + certificados generados (polling o SSE/WebSocket) |
| GET | `/projects/:id/issuance/preview?participantId=` | preview en borrador dentro del wizard |
| GET | `/issuance-requests/:rid/download` | ZIP con todos los PDFs |

### Búsqueda de certificados (transversal) y verificación
| Método | Endpoint | HU | Notas |
|---|---|---|---|
| GET | `/certificates?participant=&dni=&projectId=&typeId=&dateFrom=&dateTo=&status=&code=&sort=&page=&size=` | — | un endpoint, todos los filtros como query params |
| GET | `/certificates/suggestions?q=` | — | autocompletado por nombre/folio |
| GET | `/certificates/:id` | HU-14 | ficha |
| GET | `/certificates/:id/preview` | — | PDF/imagen para la vista previa |
| GET | `/certificates/:id/download` | HU-15 | blob de descarga |
| GET | `/public/certificates/verify/:code` | — | **sin auth**, verificación pública |

---

## 6. Flujos que merecen cuidado

### Editor de certificados
1. **Fondo:** renderiza la página del PDF con `pdfjs-dist` (o usa `pageImageUrl` del backend) y fija un sistema de coordenadas **normalizado** (0..1 o puntos del PDF), independiente del zoom.
2. **Capa de edición:** un `Konva.Stage` encima; cada campo dinámico es un `Konva.Text` arrastrable. Al soltar/editar, guarda `x, y, fontSize, color, align` en un signal `fields`.
3. **Panel lateral (Material):** bindings disponibles, propiedades del campo seleccionado y el texto fijo (HU-21).
4. **Cajas de OCR (HU-27):** guías semitransparentes no editables.
5. **Preview (HU-28):** reutiliza el componente de vista previa con un participante de muestra.

> Mantén las coordenadas **normalizadas** y deja que el backend genere el PDF final con la misma config + datos de cada participante, para que lo del editor coincida con lo descargado.

### Wizard de emisión (`mat-stepper`)
1. **Origen y modo:** desde un proyecto; eliges unitaria (1 participante) o en masa (selección múltiple con `SelectionModel`, "seleccionar todos los filtrados").
2. **Tipo y plantilla:** confirmas `certificateType` y que la plantilla esté lista; si no, bloqueas el avance y enlazas a `/projects/:id/template`.
3. **Vista previa:** renderiza con un participante de muestra (control de calidad antes de generar N).
4. **Confirmar:** `POST /issuance-requests` → redirige a `/issuance-requests/:rid` para seguir el estado (polling o SSE).

### Búsqueda de certificados
- Cada filtro es un signal; **sincronízalos con los query params de la URL** para que la búsqueda sea compartible y sobreviva al refresh.
- Conviértelos en un `computed` y aliméntalo a un `rxResource` con `debounceTime(300)`.
- Tabla con `mat-table` + paginación server-side; filtros activos como `mat-chip` removibles.

---

## 7. Orden de implementación sugerido

1. Auth + shell/layout + guards e interceptor.
2. Proyectos con landing de búsqueda por nombre y filtros (HU-06..11, 17).
3. Participantes (HU-19..25).
4. Tipos de certificado (HU-18).
5. Editor de plantilla (HU-26..29, 21).
6. **Solicitud de emisión** (depende de plantilla + participantes).
7. **Búsqueda y vista previa de certificados** (dependen de que existan certificados emitidos).
8. Verificación pública (`/verify/:code`).
9. Reportes (HU-16).

> El editor y la emisión se dejan más tarde porque dependen de que el modelo de proyectos/participantes ya esté estable.
