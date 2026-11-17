import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const condoId = authService.getActiveCondominioId();

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (condoId) {
    headers = headers.set('x-condominio-id', condoId.toString());
  }

  const cloned = req.clone({ headers });
  return next(cloned);
};
