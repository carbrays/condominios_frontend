import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-logo">🏢</div>
          <h1>CondoSuite</h1>
          <p>Sistema Integral de Gestión de Condominios</p>
        </div>

        <div *ngIf="errorMessage" class="alert-error">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="ci">Cédula de Identidad (CI)</label>
            <input id="ci" type="text" [(ngModel)]="ci" name="ci" placeholder="Ej. 1000001" required>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required>
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Autenticando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="demo-accounts">
          <span class="demo-title">Acceso rápido con cuentas demo:</span>
          <div class="demo-buttons">
            <button type="button" (click)="fillDemo('1000001')">Super Admin</button>
            <button type="button" (click)="fillDemo('2000002')">Administrador</button>
            <button type="button" (click)="fillDemo('3000003')">Conserje</button>
            <button type="button" (click)="fillDemo('4000004')">Propietario</button>
            <button type="button" (click)="fillDemo('5000005')">Inquilino</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 20px; font-family: 'Segoe UI', system-ui, sans-serif; }
    .login-card { background: #fff; width: 100%; max-width: 440px; border-radius: 16px; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
    .login-header { text-align: center; margin-bottom: 28px; }
    .brand-logo { font-size: 48px; margin-bottom: 8px; }
    .login-header h1 { margin: 0; font-size: 26px; color: #0f172a; font-weight: 800; }
    .login-header p { margin: 6px 0 0; color: #64748B; font-size: 14px; }
    .alert-error { padding: 12px; background: #fee2e2; border-left: 4px solid #ef4444; color: #991b1b; border-radius: 6px; font-size: 13px; margin-bottom: 20px; }
    .login-form { display: flex; flex-direction: column; gap: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #334155; }
    .form-group input { padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none; transition: border-color 0.2s; }
    .form-group input:focus { border-color: #1e3a8a; }
    .btn-submit { background: #1e3a8a; color: #fff; padding: 14px; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; margin-top: 6px; }
    .btn-submit:hover:not(:disabled) { background: #1e40af; }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
    .demo-accounts { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; }
    .demo-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .demo-buttons { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }
    .demo-buttons button { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer; transition: all 0.2s; }
    .demo-buttons button:hover { background: #e2e8f0; color: #0f172a; }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  ci = '1000001';
  password = 'password123';
  loading = false;
  errorMessage = '';

  fillDemo(ci: string) {
    this.ci = ci;
    this.password = 'password123';
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.ci, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error en inicio de sesión';
      }
    });
  }
}
