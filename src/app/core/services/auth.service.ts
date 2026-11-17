import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario, Condominio } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';

  currentUser = signal<Usuario | null>(null);
  condominios = signal<Condominio[]>([]);
  activeCondominio = signal<Condominio | null>(null);
  userPermissions = signal<string[]>([]);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const userStr = localStorage.getItem('user');
    const condoStr = localStorage.getItem('active_condo');
    const permsStr = localStorage.getItem('permissions');
    const condosStr = localStorage.getItem('condominios');

    if (userStr) this.currentUser.set(JSON.parse(userStr));
    if (condoStr) this.activeCondominio.set(JSON.parse(condoStr));
    if (permsStr) this.userPermissions.set(JSON.parse(permsStr));
    if (condosStr) this.condominios.set(JSON.parse(condosStr));
  }

  login(ci: string, password: string):Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { ci: ci.trim(), password }).pipe(
      tap(res => {
        if (res.success && res.data) {
          const { tokens, usuario, condominios, condominioActivo, permisos } = res.data;
          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(usuario));
          localStorage.setItem('permissions', JSON.stringify(permisos));
          localStorage.setItem('condominios', JSON.stringify(condominios));

          this.currentUser.set(usuario);
          this.condominios.set(condominios);
          this.userPermissions.set(permisos);

          if (condominioActivo) {
            localStorage.setItem('active_condo', JSON.stringify(condominioActivo));
            this.activeCondominio.set(condominioActivo);
          }
        }
      })
    );
  }

  seleccionarCondominio(condominioId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/condominio/seleccionar`, { condominio_id: condominioId }).pipe(
      tap(res => {
        if (res.success && res.data) {
          const { tokens, condominioActivo, permisos } = res.data;
          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('active_condo', JSON.stringify(condominioActivo));
          localStorage.setItem('permissions', JSON.stringify(permisos));

          this.activeCondominio.set(condominioActivo);
          this.userPermissions.set(permisos);
        }
      })
    );
  }

  hasPermission(permission: string): boolean {
    if (this.activeCondominio()?.rol_id === 'SUPER_ADMIN') return true;
    return this.userPermissions().includes(permission);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getActiveCondominioId(): number | null {
    return this.activeCondominio()?.id || null;
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
    this.activeCondominio.set(null);
    this.userPermissions.set([]);
    this.router.navigate(['/login']);
  }
}
