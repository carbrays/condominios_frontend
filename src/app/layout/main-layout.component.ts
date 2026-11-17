import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-wrapper">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">🏢</div>
          <div class="brand-text">
            <h2>CondoSuite</h2>
            <span>Administración</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">📊</span> Tablero General
          </a>
          <a routerLink="/condominios" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('CONDOMINIO_VER') || auth.activeCondominio()?.rol_id === 'SUPER_ADMIN'">
            <span class="icon">🏢</span> Condominios
          </a>
          <a routerLink="/membresias" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('PERSONA_VER') || auth.activeCondominio()?.rol_id === 'SUPER_ADMIN'">
            <span class="icon">👥</span> Membresías y Roles
          </a>
          <a routerLink="/unidades" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('UNIDAD_VER')">
            <span class="icon">🚪</span> Unidades y Residentes
          </a>
          <a routerLink="/finanzas" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('EXPENSA_VER')">
            <span class="icon">💰</span> Expensas y Finanzas
          </a>
          <a routerLink="/pagos" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('PAGO_VER')">
            <span class="icon">💳</span> Validación de Pagos
          </a>
          <a routerLink="/conserjeria" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('CONSERJERIA_VER')">
            <span class="icon">🛡️</span> Conserjería y Portería
          </a>
          <a routerLink="/reservas" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('RESERVA_VER')">
            <span class="icon">🏊</span> Áreas y Reservas
          </a>
          <a routerLink="/incidencias" routerLinkActive="active" class="nav-item" *ngIf="auth.hasPermission('INCIDENCIA_VER')">
            <span class="icon">🔧</span> Incidencias
          </a>
        </nav>
      </aside>

      <!-- MAIN CONTAINER -->
      <div class="main-container">
        <!-- TOPBAR -->
        <header class="topbar">
          <div class="condo-selector">
            <span class="label">Condominio Activo:</span>
            <select (change)="onCondoChange($event)">
              <option *ngFor="let c of auth.condominios()" [value]="c.id" [selected]="c.id === auth.activeCondominio()?.id">
                {{ c.nombre }} ({{ c.rol_id }})
              </option>
            </select>
          </div>

          <div class="user-profile">
            <div class="user-info">
              <span class="name">{{ auth.currentUser()?.nombres }} {{ auth.currentUser()?.apellidos }}</span>
              <span class="role-badge">{{ auth.activeCondominio()?.rol_id || 'USUARIO' }}</span>
            </div>
            <button class="btn-logout" (click)="auth.logout()" title="Cerrar Sesión">🚪 Salir</button>
          </div>
        </header>

        <!-- CONTENT -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper { display: flex; height: 100vh; overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; }
    .sidebar { width: 260px; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar-brand { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #1e293b; }
    .brand-icon { font-size: 28px; }
    .brand-text h2 { margin: 0; font-size: 18px; color: #fff; font-weight: 700; }
    .brand-text span { font-size: 12px; color: #94a3b8; }
    .sidebar-nav { padding: 16px 8px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #94a3b8; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .nav-item:hover { background: #1e293b; color: #fff; }
    .nav-item.active { background: #1e3a8a; color: #fff; font-weight: 600; }
    .main-container { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
    .topbar { height: 64px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
    .condo-selector { display: flex; align-items: center; gap: 10px; }
    .condo-selector .label { font-size: 13px; font-weight: 600; color: #475569; }
    .condo-selector select { padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; color: #1e293b; background: #f8fafc; cursor: pointer; }
    .user-profile { display: flex; align-items: center; gap: 16px; }
    .user-info { display: flex; flex-direction: column; align-items: flex-end; }
    .user-info .name { font-size: 14px; font-weight: 600; color: #0f172a; }
    .role-badge { font-size: 11px; padding: 2px 8px; background: #e0f2fe; color: #0369a1; border-radius: 12px; font-weight: 700; }
    .btn-logout { background: none; border: 1px solid #fee2e2; color: #dc2626; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-logout:hover { background: #fee2e2; }
    .page-content { flex: 1; overflow-y: auto; padding: 24px; }
  `]
})
export class MainLayoutComponent {
  auth = inject(AuthService);

  onCondoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const condoId = parseInt(select.value, 10);
    if (!isNaN(condoId)) {
      this.auth.seleccionarCondominio(condoId).subscribe({
        next: () => window.location.reload()
      });
    }
  }
}
