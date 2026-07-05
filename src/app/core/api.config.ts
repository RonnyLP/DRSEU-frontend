/**
 * Configuración compartida de acceso a la API del backend (certificadosDRSU).
 *
 * Claves de localStorage acordadas para la sesión: el módulo de Autenticación
 * debe guardar aquí el JWT y el id del usuario logueado al hacer login.
 */
/**
 * Ruta relativa: en desarrollo el dev-server redirige `/api` al backend
 * (ver proxy.conf.json), lo que evita problemas de CORS sin tocar el backend.
 */
export const API_BASE_URL = '/api';

export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_ID_KEY = 'auth_user_id';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Id del usuario logueado (lo requiere el backend como `idCreadoPor`).
 * Mientras el módulo de Autenticación no guarde `auth_user_id`, se usa 1
 * (usuario admin sembrado) como valor de desarrollo.
 */
export function getCurrentUserId(): number {
  const raw = localStorage.getItem(AUTH_USER_ID_KEY);
  const id = raw ? Number(raw) : NaN;
  return Number.isFinite(id) && id > 0 ? id : 1;
}
