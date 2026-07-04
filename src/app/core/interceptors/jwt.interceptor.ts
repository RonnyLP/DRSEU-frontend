import { HttpInterceptorFn } from '@angular/common/http';
import { getAuthToken } from '../api.config';

/** Adjunta el JWT guardado por el módulo de Autenticación a cada petición a la API. */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getAuthToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
