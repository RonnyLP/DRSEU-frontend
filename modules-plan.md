# Plan de módulos — DRSEU Frontend

Sistema universitario de gestión de proyectos y emisión de certificados.

---

## Autenticación (HU-01..05)

**Frontend**
- Formularios con Reactive Forms: login, registro (solo admin), recuperar/resetear contraseña, cambiar contraseña
- `AuthInterceptor`: adjunta JWT a cada request; si recibe 401, intenta `POST /auth/refresh` y reintenta
- `authGuard` protege todas las rutas excepto `/auth/**` y `/verify/:code`
- Al recargar: `GET /auth/me` para rehidratar la sesión del SignalStore antes de renderizar

**Backend**

| Método | Endpoint | Notas |
|--------|----------|-------|
| POST | `/auth/login` | Devuelve `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | Rota el refreshToken |
| POST | `/auth/logout` | Invalida el refreshToken en servidor |
| POST | `/auth/recover-password` | Recibe `{ email }`, envía correo con token |
| POST | `/auth/reset-password` | Recibe `{ token, newPassword }` |
| POST | `/auth/change-password` | Requiere `{ currentPassword, newPassword }` + JWT |
| POST | `/users` | Solo rol admin |
| GET  | `/auth/me` | Devuelve perfil del token activo |

---

## Gestión de proyectos (HU-06..17)

**Frontend**
- Landing `/projects`: `mat-table` + paginación server-side; filtros por nombre, persona, rango de fechas, estado (chips removibles); autocompletado con `mat-autocomplete`
- Filtros sincronizados con query params de la URL (compartibles y sobreviven al refresh)
- Formulario de creación/edición con campos: nombre, descripción, fechas, estado
- Vista de detalle con `mat-tabs`: info general, participantes, plantilla, certificados emitidos
- Botón de descarga de reporte (blob Excel/PDF)

**Backend**

| Método | Endpoint | Notas |
|--------|----------|-------|
| GET | `/projects?name=&person=&dateFrom=&dateTo=&status=&sort=&page=&size=` | Todos los filtros en un solo endpoint |
| GET | `/projects/suggestions?q=` | Para el autocomplete |
| GET/POST | `/projects` | Lista y creación |
| GET/PUT/DELETE | `/projects/:id` | CRUD individual |
| GET | `/projects/:id/report` | Devuelve blob (Excel o PDF) |

---

## Gestión de participantes (HU-12,13,19..25)

**Frontend**
- `mat-table` con checkbox (`SelectionModel` del CDK) para selección múltiple
- Alta individual (formulario) y carga masiva (subir archivo CSV/Excel → `POST .../bulk`)
- Edición inline o modal: nombre, DNI, email, tipo de participación (`certificateTypeId`)
- Confirm-dialog antes de eliminar
- Ordenación server-side o `MatTableDataSource.sort`

**Backend**

| Método | Endpoint | Notas |
|--------|----------|-------|
| GET | `/projects/:id/participants?sort=name` | Lista con orden |
| POST | `/projects/:id/participants` | Alta individual |
| POST | `/projects/:id/participants/bulk` | Carga masiva (CSV/Excel) |
| GET/PUT/DELETE | `/projects/:id/participants/:pid` | CRUD individual |
| PUT | `/projects/:id/participants/:pid/participation-type` | Cambia tipo → `{ certificateTypeId }` |

---

## Búsqueda y filtros (HU-06..11 transversal)

**Frontend**
- Cada filtro es un signal; se computan en un `computed` y se pasan a un `rxResource` con `debounceTime(300)`
- Sincronización con query params de URL
- `mat-table` + paginación server-side; filtros activos como `mat-chip` removibles
- Autocompletado por nombre o folio
- Vista de detalle de certificado (`/certificates/:id`) y preview en componente reutilizable
- Ruta pública `/verify/:code` sin `authGuard`

**Backend**

| Método | Endpoint | Notas |
|--------|----------|-------|
| GET | `/certificates?participant=&dni=&projectId=&typeId=&dateFrom=&dateTo=&status=&code=&sort=&page=&size=` | Todos los filtros como query params |
| GET | `/certificates/suggestions?q=` | Autocomplete por nombre/folio |
| GET | `/public/certificates/verify/:code` | **Sin autenticación**, verificación pública |

---

## Certificados — editor, emisión y descarga (HU-14,15,18,21,26..29)

### Catálogo de tipos (`/certificate-types`)

**Frontend**
- CRUD simple en `mat-table`

**Backend**

| Método | Endpoint |
|--------|----------|
| GET/POST | `/certificate-types` |
| PUT/DELETE | `/certificate-types/:id` |

### Editor de plantilla (`/projects/:id/template`)

**Frontend**
- Sube PDF → backend responde con imagen de página + dimensiones
- Renderiza la imagen como fondo; capa `Konva.Stage` encima con campos arrastrables (`Konva.Text`)
- Coordenadas **normalizadas** (0..1) para independencia del zoom
- Panel lateral: bindings disponibles (`participant.fullName`, `participation.type`, `static`), propiedades del campo seleccionado
- Cajas OCR como guías semitransparentes (no editables)
- Guarda la config con `PUT /projects/:id/template`

**Backend**

| Método | Endpoint | Notas |
|--------|----------|-------|
| POST | `/projects/:id/template` | Multipart PDF → `{ pageImageUrl, dimensions }` |
| POST | `/projects/:id/template/ocr` | Backend extrae bloques de texto → `{ blocks[] }` |
| PUT | `/projects/:id/template` | Guarda `{ description, fields[] }` con coords normalizadas |

### Wizard de emisión (`/projects/:id/issuance/new`)

**Frontend** — `mat-stepper` con 4 pasos:
1. Elegir modo (unitaria / masa) y seleccionar participantes
2. Confirmar tipo de certificado y que la plantilla esté lista
3. Preview con participante de muestra
4. Confirmar → `POST /issuance-requests` → redirige al detalle para seguimiento (polling o SSE)

**Backend**

| Método | Endpoint | Notas |
|--------|----------|-------|
| POST | `/issuance-requests` | Generación asíncrona → `{ id, status: 'queued' }` |
| GET | `/issuance-requests?projectId=&status=` | Bandeja de seguimiento |
| GET | `/issuance-requests/:rid` | Estado + progreso (polling / SSE / WebSocket) |
| GET | `/projects/:id/issuance/preview?participantId=` | Preview en borrador (wizard paso 3) |
| GET | `/issuance-requests/:rid/download` | ZIP de todos los PDFs |

### Ficha y descarga de certificados

**Backend**

| Método | Endpoint | Notas |
|--------|----------|-------|
| GET | `/certificates/:id` | Ficha del certificado |
| GET | `/certificates/:id/preview` | PDF/imagen para vista previa |
| GET | `/certificates/:id/download` | Blob de descarga individual |

---

## Orden de implementación

1. Auth + shell/layout + guards e interceptor
2. Proyectos con búsqueda y filtros (HU-06..11, 17)
3. Participantes (HU-19..25)
4. Tipos de certificado (HU-18)
5. Editor de plantilla (HU-26..29, 21)
6. Solicitud de emisión (depende de plantilla + participantes)
7. Búsqueda y vista previa de certificados (dependen de que existan certificados emitidos)
8. Verificación pública (`/verify/:code`)
9. Reportes (HU-16)
