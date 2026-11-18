import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { IconComponent } from '../core/components/icon.component';
import { ConfirmDialogComponent } from '../core/components/confirm-dialog.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, ConfirmDialogComponent],
  template: `
    <div class="app-shell">
      <!-- SIDEBAR FIJO -->
      <aside class="sidebar">
        <!-- Brand Header -->
        <div class="sidebar-header">
          <div class="brand-logo">
            <app-icon name="shield" [size]="20" [strokeWidth]="2.5"></app-icon>
          </div>
          <div class="brand-info">
            <div class="brand-title-row">
              <span class="brand-title">CondoCore</span>
              <span class="badge-version">v2.4 Pro</span>
            </div>
            <span class="brand-subtitle">Gestión de Condominios</span>
          </div>
        </div>

        <!-- Navegación -->
        <nav class="sidebar-menu">
          <div class="menu-category">GESTIÓN DE CONDOMINIO</div>

          <a routerLink="/dashboard" routerLinkActive="active" class="menu-item">
            <app-icon name="dashboard" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Panel Principal</span>
            <span class="rf-badge">RF-08</span>
          </a>

          <a routerLink="/unidades" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('UNIDAD_VER')">
            <app-icon name="building" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Catastro y Alícuotas</span>
            <span class="rf-badge">RF-01</span>
          </a>

          <a routerLink="/personas" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('PERSONA_VER') || auth.activeCondominio()?.rol_id === 'SUPER_ADMIN'">
            <app-icon name="users" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Personas y Residentes</span>
            <span class="rf-badge">RF-02</span>
          </a>

          <a routerLink="/membresias" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('PERSONA_VER') || auth.activeCondominio()?.rol_id === 'SUPER_ADMIN'">
            <app-icon name="shield" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Membresías y Roles</span>
          </a>

          <a routerLink="/finanzas" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('EXPENSA_VER')">
            <app-icon name="receipt" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Finanzas y Pagos QR</span>
            <span class="rf-badge">RF-05</span>
          </a>

          <a routerLink="/pagos" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('PAGO_VER')">
            <app-icon name="qr" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Validación de Pagos</span>
            <span class="status-dot"></span>
          </a>

          <a routerLink="/reservas" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('RESERVA_VER')">
            <app-icon name="calendar" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Áreas y Reservas</span>
            <span class="rf-badge">RF-06</span>
          </a>

          <a routerLink="/comunicados" routerLinkActive="active" class="menu-item">
            <app-icon name="megaphone" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Cartelera y Eventos</span>
            <span class="rf-badge">RF-08</span>
          </a>

          <a routerLink="/incidencias" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('INCIDENCIA_VER')">
            <app-icon name="wrench" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Incidencias y Averías</span>
            <span class="rf-badge">RF-09</span>
          </a>

          <a routerLink="/conserjeria" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('CONSERJERIA_VER')">
            <app-icon name="shield" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Conserjería y Accesos</span>
          </a>

          <a routerLink="/asambleas" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('ENCUESTA_VER') || auth.activeCondominio()?.rol_id === 'SUPER_ADMIN'">
            <app-icon name="vote" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Asambleas y Votaciones</span>
            <span class="rf-badge">RF-07</span>
          </a>

          <div class="menu-category" *ngIf="auth.hasPermission('CONDOMINIO_VER') || auth.activeCondominio()?.rol_id === 'SUPER_ADMIN'">SISTEMA</div>

          <a routerLink="/condominios" routerLinkActive="active" class="menu-item" *ngIf="auth.hasPermission('CONDOMINIO_VER') || auth.activeCondominio()?.rol_id === 'SUPER_ADMIN'">
            <app-icon name="shield-alert" [size]="18" customClass="menu-icon"></app-icon>
            <span class="menu-label">Super Administrador</span>
            <span class="tenant-badge">Multi-Tenant</span>
          </a>
        </nav>

        <!-- User Footer -->
        <div class="sidebar-user">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <div class="user-status-row">
              <span class="online-dot"></span>
              <span class="user-role">{{ auth.activeCondominio()?.rol_id || 'Administrador' }}</span>
            </div>
          </div>
          <button class="btn-logout" (click)="auth.logout()" title="Cerrar Sesión">
            <app-icon name="log-out" [size]="16"></app-icon>
          </button>
        </div>
      </aside>

      <!-- CONTENIDO PRINCIPAL -->
      <div class="main-viewport">
        <!-- TOPBAR -->
        <header class="topbar">
          <!-- Selector Multi-Tenant -->
          <div class="condo-selector-box">
            <app-icon name="building" [size]="16" customClass="condo-icon"></app-icon>
            <select class="condo-select" (change)="onCondoChange($event)">
              <option *ngFor="let c of auth.condominios()" [value]="c.id" [selected]="c.id === auth.activeCondominio()?.id">
                {{ c.nombre }} {{ c.rol_id ? '(' + c.rol_id + ')' : '' }}
              </option>
            </select>
          </div>

          <!-- Buscador Global -->
          <div class="search-box">
            <div class="search-box-container">
              <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
              <input 
                type="search" 
                class="clean-search-input" 
                [(ngModel)]="searchGlobalQuery"
                placeholder="Buscar unidad, residente, factura o proveedor... (Ctrl+K)" 
              />
              <button 
                *ngIf="searchGlobalQuery" 
                type="button" 
                class="clean-clear-btn" 
                (click)="searchGlobalQuery = ''"
                title="Borrar texto">
                ✕
              </button>
              <kbd class="search-kbd" *ngIf="!searchGlobalQuery">Ctrl K</kbd>
            </div>
          </div>

          <!-- Acciones Rápidas del Topbar -->
          <div class="topbar-actions">
            <!-- Notificaciones -->
            <button class="topbar-btn" title="Notificaciones">
              <app-icon name="bell" [size]="18"></app-icon>
              <span class="notification-badge">2</span>
            </button>

            <!-- Exportar Excel -->
            <button class="btn btn-outline btn-sm topbar-action-btn" title="Exportar reporte en formato Excel">
              <app-icon name="excel" [size]="15"></app-icon>
              <span>Excel</span>
            </button>

            <!-- Exportar PDF -->
            <button class="btn btn-primary btn-sm topbar-action-btn" title="Exportar reporte en formato PDF">
              <app-icon name="pdf" [size]="15"></app-icon>
              <span>PDF</span>
            </button>

            <!-- Historial RF-13 -->
            <button class="btn btn-outline btn-sm topbar-action-btn" title="Bitácora de Auditoría RF-13">
              <app-icon name="history" [size]="15"></app-icon>
              <span>Auditoría</span>
            </button>
          </div>
        </header>

        <!-- VIEWPORT CONTENT -->
        <main class="content-scroll">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- MODAL GLOBAL DE CONFIRMACIÓN ELEGANTE -->
      <app-confirm-dialog></app-confirm-dialog>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: var(--surface);
    }

    /* SIDEBAR */
    .sidebar {
      width: 275px;
      background-color: var(--primary);
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      z-index: 20;
    }

    .sidebar-header {
      padding: 20px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #022c22;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }

    .brand-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .brand-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 16.5px;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .badge-version {
      font-size: 10px;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .brand-subtitle {
      font-size: 11.5px;
      color: #64748b;
      font-weight: 500;
    }

    .sidebar-menu {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow-y: auto;
    }

    .menu-category {
      font-size: 10.5px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.08em;
      padding: 12px 10px 6px;
      text-transform: uppercase;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9.5px 12px;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 9px;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.15s ease;
      position: relative;
    }

    .menu-item:hover {
      background-color: var(--primary-hover);
      color: #f1f5f9;
    }

    .menu-item.active {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 600;
      box-shadow: inset 3px 0 0 #10b981;
    }

    .menu-item.active .menu-icon {
      color: #10b981;
    }

    .menu-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rf-badge {
      font-size: 10px;
      font-weight: 700;
      font-family: monospace;
      color: #34d399;
      background: rgba(16, 185, 129, 0.1);
      padding: 2px 5px;
      border-radius: 4px;
    }

    .tenant-badge {
      font-size: 10px;
      font-weight: 600;
      color: #93c5fd;
      background: rgba(59, 130, 246, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 9999px;
    }

    /* User Footer */
    .sidebar-user {
      padding: 14px 16px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: #334155;
      color: #f8fafc;
      border-radius: 9px;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-status-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .online-dot {
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 9999px;
      box-shadow: 0 0 6px #10b981;
    }

    .user-role {
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-logout {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .btn-logout:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    /* MAIN VIEWPORT */
    .main-viewport {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow: hidden;
    }

    /* TOPBAR */
    .topbar {
      height: 64px;
      background-color: #ffffff;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
      z-index: 10;
    }

    .condo-selector-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 4px 10px;
    }

    .condo-icon {
      color: var(--muted);
    }

    .condo-select {
      background: transparent;
      border: none;
      outline: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
      cursor: pointer;
    }

    .search-box {
      flex: 1;
      max-width: 480px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--muted-light);
    }

    .search-input {
      width: 100%;
      height: 38px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 0 70px 0 36px;
      font-size: 13px;
      color: var(--ink);
      outline: none;
      transition: all 0.15s ease;
    }

    .search-input:focus {
      background-color: #ffffff;
      border-color: #94a3b8;
      box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
    }

    .search-kbd {
      position: absolute;
      right: 10px;
      background: #e2e8f0;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      font-family: monospace;
      pointer-events: none;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .topbar-btn {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #475569;
      transition: all 0.15s ease;
    }

    .topbar-btn:hover {
      background-color: #e2e8f0;
      color: var(--ink);
    }

    .notification-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 15px;
      height: 15px;
      background: var(--danger);
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
    }

    .topbar-action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* SCROLLABLE VIEWPORT */
    .content-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px 48px;
    }

    .content-container {
      max-width: 1340px;
      margin: 0 auto;
    }
  `]
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  searchGlobalQuery: string = '';

  get userName(): string {
    const user = this.auth.currentUser();
    return user ? `${user.nombres} ${user.apellidos}` : 'Willy Chambilla';
  }

  get userInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return 'WC';
    const n = user.nombres ? user.nombres[0] : 'W';
    const a = user.apellidos ? user.apellidos[0] : 'C';
    return (n + a).toUpperCase();
  }

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
