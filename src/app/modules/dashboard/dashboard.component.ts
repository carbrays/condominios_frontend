import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { DashboardStats } from '../../core/models/models';
import { IconComponent } from '../../core/components/icon.component';
import { Subscription } from 'rxjs';

interface UnidadMorosidad {
  unidad: string;
  responsable: string;
  alicuota: number;
  saldo: number;
  estado: 'AL_DIA' | 'MOROSO' | 'PENDIENTE';
  mesesMora: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dashboard-container">
      <!-- HEADER DEL DASHBOARD -->
      <div class="dashboard-header">
        <div class="header-titles">
          <div class="header-tag-row">
            <span class="badge badge-rf">RF-08</span>
            <span class="condo-badge">{{ auth.activeCondominio()?.nombre || 'Condominio Los Tajibos' }}</span>
          </div>
          <h1 class="header-title">Panel Principal de Gestión</h1>
          <p class="header-subtitle">
            Supervisión operativa, conciliación y estado de cuenta • Período {{ stats?.periodo || currentMonthYear }}
          </p>
        </div>

        <!-- Acciones Rápidas -->
        <div class="header-actions">
          <button class="btn btn-outline" (click)="loadStats()" [disabled]="loading">
            <app-icon name="refresh" [size]="15" [customClass]="loading ? 'spin' : ''"></app-icon>
            <span>Actualizar</span>
          </button>
          <button class="btn btn-primary" (click)="openEmitirExpensas()">
            <app-icon name="receipt" [size]="15"></app-icon>
            <span>Emitir Expensas</span>
          </button>
          <button class="btn btn-accent" (click)="openRegistrarPagoQR()">
            <app-icon name="qr" [size]="16"></app-icon>
            <span>Registrar Pago QR</span>
          </button>
        </div>
      </div>

      <!-- 4 TARJETAS KPI SUPERIORES -->
      <div class="kpis-grid">
        <!-- KPI 1: Ingresos Conciliados -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Ingresos Conciliados</span>
            <div class="kpi-icon-box bg-emerald">
              <app-icon name="arrow-up-right" [size]="18" customClass="text-emerald"></app-icon>
            </div>
          </div>
          <div class="kpi-main">
            <h2 class="kpi-value">Bs. {{ (stats?.finanzas?.cobrado || 28450) | number:'1.2-2' }}</h2>
            <div class="kpi-trend">
              <span class="trend-badge positive">+4.2%</span>
              <span class="trend-sub">vs. mes anterior</span>
            </div>
          </div>
          <div class="kpi-footer">
            <span>Meta mensual: Bs. {{ (stats?.finanzas?.total_facturado || 33790) | number:'1.0-0' }}</span>
            <span class="kpi-percentage">84.2% recaudado</span>
          </div>
        </div>

        <!-- KPI 2: Egresos Operativos -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Egresos Operativos</span>
            <div class="kpi-icon-box bg-slate">
              <app-icon name="arrow-down-right" [size]="18" customClass="text-slate"></app-icon>
            </div>
          </div>
          <div class="kpi-main">
            <h2 class="kpi-value">Bs. {{ egresosCalculados | number:'1.2-2' }}</h2>
            <div class="kpi-trend">
              <span class="trend-badge savings">-1.8%</span>
              <span class="trend-sub">ahorro mensual</span>
            </div>
          </div>
          <div class="kpi-footer">
            <span>Mantenimiento y servicios</span>
            <span class="badge badge-slate">Al día</span>
          </div>
        </div>

        <!-- KPI 3: Fondo de Reserva (RF-06) -->
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-label-row">
              <span class="kpi-label">Fondo de Reserva</span>
              <span class="badge badge-rf">RF-06</span>
            </div>
            <div class="kpi-icon-box bg-purple">
              <app-icon name="wallet" [size]="18" customClass="text-purple"></app-icon>
            </div>
          </div>
          <div class="kpi-main">
            <h2 class="kpi-value">Bs. {{ (stats?.finanzas?.fondo_reserva || 64800) | number:'1.2-2' }}</h2>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" [style.width]="'81%'"></div>
            </div>
          </div>
          <div class="kpi-footer">
            <span>Meta de contingencia anual: Bs. 80.000</span>
            <span class="kpi-percentage">81%</span>
          </div>
        </div>

        <!-- KPI 4: Índice de Morosidad -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Índice de Morosidad</span>
            <div class="kpi-icon-box bg-rose">
              <app-icon name="alert-triangle" [size]="18" customClass="text-rose"></app-icon>
            </div>
          </div>
          <div class="kpi-main">
            <div class="kpi-value-row">
              <h2 class="kpi-value text-danger">15.8%</h2>
              <span class="kpi-sub-amount">Bs. {{ (stats?.finanzas?.pendiente || 5340) | number:'1.2-2' }}</span>
            </div>
            <div class="kpi-trend">
              <span class="trend-badge warning">{{ stats?.finanzas?.unidades_en_mora || 3 }} unidades</span>
              <span class="trend-sub">pendientes de pago</span>
            </div>
          </div>
          <div class="kpi-footer">
            <span>Alertas automáticas</span>
            <span class="badge badge-danger">3 vencidas</span>
          </div>
        </div>
      </div>

      <!-- SECCIÓN PRINCIPAL: FLUJO DE CAJA Y TABLA DE ESTADOS -->
      <div class="dashboard-columns">
        <!-- COLUMNA IZQUIERDA: FLUJO DE CAJA SEMESTRAL (GRÁFICO CSS) -->
        <div class="ui-card chart-column">
          <div class="card-header-row">
            <div>
              <h3 class="card-section-title">Flujo de Caja Semestral</h3>
              <p class="card-section-subtitle">Comparativa de ingresos y egresos (Junio - Noviembre 2026)</p>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot bg-accent"></span>
                <span>Ingresos</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot bg-primary"></span>
                <span>Egresos</span>
              </div>
            </div>
          </div>

          <!-- Resumen de Superávit -->
          <div class="surplus-banner">
            <div class="surplus-info">
              <span class="surplus-label">Superávit Operativo Neto</span>
              <span class="surplus-val">+Bs. 11.530,00</span>
            </div>
            <span class="badge badge-accent">Saldo Favorable</span>
          </div>

          <!-- Gráfico de Barras Bicolores CSS -->
          <div class="barchart-container">
            <div class="bar-col" *ngFor="let m of flujoSemestral">
              <div class="bar-pair">
                <!-- Barra Ingreso -->
                <div class="bar-wrapper">
                  <div class="bar-fill bar-income" [style.height]="m.ingresoPct + '%'" [title]="'Ingreso: Bs. ' + m.ingreso"></div>
                </div>
                <!-- Barra Egreso -->
                <div class="bar-wrapper">
                  <div class="bar-fill bar-expense" [style.height]="m.egresoPct + '%'" [title]="'Egreso: Bs. ' + m.egreso"></div>
                </div>
              </div>
              <span class="bar-month">{{ m.mes }}</span>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: ESTADO DE CUENTA POR UNIDAD Y MOROSIDAD -->
        <div class="ui-card table-column">
          <div class="card-header-row">
            <div>
              <h3 class="card-section-title">Estado de Cuenta y Cobranzas</h3>
              <p class="card-section-subtitle">Gestión de alícuotas, cuotas ordinarias y morosidad</p>
            </div>
            <!-- Filtros de Estado -->
            <div class="filter-pills">
              <button 
                class="filter-pill" 
                [class.active]="filtroEstado === 'TODOS'" 
                (click)="filtroEstado = 'TODOS'">
                Todas
              </button>
              <button 
                class="filter-pill" 
                [class.active]="filtroEstado === 'MOROSO'" 
                (click)="filtroEstado = 'MOROSO'">
                Morosos
              </button>
              <button 
                class="filter-pill" 
                [class.active]="filtroEstado === 'PENDIENTE'" 
                (click)="filtroEstado = 'PENDIENTE'">
                Pendientes
              </button>
              <button 
                class="filter-pill" 
                [class.active]="filtroEstado === 'AL_DIA'" 
                (click)="filtroEstado = 'AL_DIA'">
                Al día
              </button>
            </div>
          </div>

          <!-- Tabla de Unidades -->
          <div class="table-wrapper">
            <table class="ui-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Responsable</th>
                  <th>Alícuota</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th style="text-align: right;">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of unidadesFiltradas">
                  <td>
                    <span class="unit-code">{{ u.unidad }}</span>
                  </td>
                  <td>
                    <span class="responsible-name">{{ u.responsable }}</span>
                  </td>
                  <td>
                    <span class="alicuota-val">{{ u.alicuota }}%</span>
                  </td>
                  <td>
                    <span class="amount-val" [class.text-danger]="u.saldo > 0">
                      Bs. {{ u.saldo | number:'1.2-2' }}
                    </span>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      [class.badge-accent]="u.estado === 'AL_DIA'"
                      [class.badge-danger]="u.estado === 'MOROSO'"
                      [class.badge-warning]="u.estado === 'PENDIENTE'">
                      {{ u.estado === 'AL_DIA' ? 'Al día' : (u.estado === 'MOROSO' ? 'Moroso (' + u.mesesMora + 'm)' : 'Pendiente') }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button 
                      *ngIf="u.saldo > 0" 
                      class="btn btn-sm btn-outline btn-action-send"
                      (click)="enviarRecordatorio(u)"
                      title="Enviar recordatorio vía WhatsApp">
                      <app-icon name="send" [size]="13"></app-icon>
                      <span>Avisar</span>
                    </button>
                    <span *ngIf="u.saldo === 0" class="paid-check">
                      <app-icon name="check-circle" [size]="16" customClass="text-emerald"></app-icon>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECCIÓN SECUNDARIA: OPERACIONES EN TIEMPO REAL -->
      <div class="live-grid">
        <div class="ui-card live-card">
          <div class="live-header">
            <div class="live-icon-box bg-slate">
              <app-icon name="shield" [size]="18" customClass="text-primary"></app-icon>
            </div>
            <div>
              <h4 class="live-title">Portería y Accesos en Vivo</h4>
              <span class="live-subtitle">Sincronizado vía Socket.IO</span>
            </div>
          </div>
          <div class="live-body">
            <span class="live-num">{{ stats?.operaciones?.visitas_en_curso || 4 }}</span>
            <span class="live-desc">Visitas activas actualmente dentro del condominio</span>
          </div>
          <div class="live-footer">
            <span class="status-live-dot"></span>
            <span>Monitoreo en tiempo real</span>
          </div>
        </div>

        <div class="ui-card live-card">
          <div class="live-header">
            <div class="live-icon-box bg-warning">
              <app-icon name="alert-triangle" [size]="18" customClass="text-warning"></app-icon>
            </div>
            <div>
              <h4 class="live-title">Novedades e Incidencias</h4>
              <span class="live-subtitle">Mantenimiento y quejas</span>
            </div>
          </div>
          <div class="live-body">
            <span class="live-num text-warning">{{ stats?.operaciones?.incidencias_pendientes || 2 }}</span>
            <span class="live-desc">Reportes de averías pendientes de resolución</span>
          </div>
          <div class="live-footer">
            <span class="badge badge-warning">Atención requerida</span>
          </div>
        </div>

        <div class="ui-card live-card">
          <div class="live-header">
            <div class="live-icon-box bg-emerald">
              <app-icon name="building" [size]="18" customClass="text-emerald"></app-icon>
            </div>
            <div>
              <h4 class="live-title">Reservas de Áreas Hoy</h4>
              <span class="live-subtitle">Parrillero, piscina y salón</span>
            </div>
          </div>
          <div class="live-body">
            <span class="live-num text-emerald">{{ stats?.operaciones?.reservas_hoy || 1 }}</span>
            <span class="live-desc">Área social reservada con depósito de garantía</span>
          </div>
          <div class="live-footer">
            <span class="badge badge-accent">Sin solapamientos</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* HEADER */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .header-tag-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .condo-badge {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .header-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: -0.02em;
    }

    .header-subtitle {
      font-size: 13.5px;
      color: var(--muted);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* KPIS GRID */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }

    @media (max-width: 1100px) {
      .kpis-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-label-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .kpi-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
    }

    .kpi-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg-emerald { background: #d1fae5; }
    .text-emerald { color: #059669; }

    .bg-slate { background: #f1f5f9; }
    .text-slate { color: #334155; }

    .bg-purple { background: #ede9fe; }
    .text-purple { color: #7c3aed; }

    .bg-rose { background: #ffe4e6; }
    .text-rose { color: #e11d48; }

    .bg-warning { background: #fef3c7; }
    .text-warning { color: #d97706; }

    .kpi-main {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--ink);
    }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .kpi-sub-amount {
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
    }

    .text-danger {
      color: #ef4444;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .trend-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
    }

    .trend-badge.positive {
      background: #d1fae5;
      color: #065f46;
    }

    .trend-badge.savings {
      background: #e0f2fe;
      color: #0369a1;
    }

    .trend-badge.warning {
      background: #fee2e2;
      color: #991b1b;
    }

    .trend-sub {
      color: #94a3b8;
    }

    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 4px;
    }

    .progress-bar-fill {
      height: 100%;
      background: #7c3aed;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .kpi-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      color: var(--muted);
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
    }

    .kpi-percentage {
      font-weight: 700;
      color: var(--ink);
    }

    /* COLUMNAS CENTRALES */
    .dashboard-columns {
      display: grid;
      grid-template-columns: 5fr 7fr;
      gap: 20px;
    }

    @media (max-width: 1000px) {
      .dashboard-columns {
        grid-template-columns: 1fr;
      }
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      gap: 12px;
    }

    .card-section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
    }

    .card-section-subtitle {
      font-size: 12.5px;
      color: var(--muted);
      margin-top: 2px;
    }

    .chart-legend {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--muted);
      font-weight: 500;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
    }

    .bg-accent { background-color: var(--accent); }
    .bg-primary { background-color: var(--primary); }

    .surplus-banner {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .surplus-info {
      display: flex;
      flex-direction: column;
    }

    .surplus-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
    }

    .surplus-val {
      font-size: 16px;
      font-weight: 800;
      color: #059669;
    }

    /* BARCHART CSS */
    .barchart-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 190px;
      padding-top: 10px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }

    .bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .bar-pair {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 150px;
      width: 32px;
      justify-content: center;
    }

    .bar-wrapper {
      width: 12px;
      height: 100%;
      display: flex;
      align-items: flex-end;
    }

    .bar-fill {
      width: 100%;
      border-radius: 4px 4px 0 0;
      transition: height 0.4s ease;
      cursor: pointer;
    }

    .bar-fill:hover {
      opacity: 0.85;
    }

    .bar-income {
      background-color: var(--accent);
    }

    .bar-expense {
      background-color: var(--primary);
    }

    .bar-month {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
    }

    /* FILTROS Y TABLA */
    .filter-pills {
      display: flex;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }

    .filter-pill {
      background: none;
      border: none;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-pill.active {
      background: #ffffff;
      color: var(--ink);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .unit-code {
      font-weight: 700;
      color: var(--ink);
      font-size: 13px;
    }

    .responsible-name {
      font-size: 12.5px;
      color: #334155;
    }

    .alicuota-val {
      font-family: monospace;
      font-weight: 600;
      color: var(--muted);
      font-size: 12px;
    }

    .amount-val {
      font-weight: 700;
      font-size: 12.5px;
      color: var(--ink);
    }

    .btn-action-send {
      padding: 4px 8px;
      gap: 5px;
    }

    .paid-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* OPERACIONES EN VIVO */
    .live-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    @media (max-width: 900px) {
      .live-grid {
        grid-template-columns: 1fr;
      }
    }

    .live-card {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .live-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .live-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .live-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ink);
    }

    .live-subtitle {
      font-size: 11.5px;
      color: var(--muted);
    }

    .live-body {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .live-num {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
    }

    .live-desc {
      font-size: 12.5px;
      color: #475569;
    }

    .live-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: var(--muted);
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }

    .status-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      background-color: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private socket = inject(SocketService);

  stats: DashboardStats | null = null;
  loading: boolean = false;
  filtroEstado: 'TODOS' | 'MOROSO' | 'PENDIENTE' | 'AL_DIA' = 'TODOS';
  private subs: Subscription[] = [];

  // Datos de Flujo Semestral
  flujoSemestral = [
    { mes: 'Jun', ingreso: 24100, egreso: 15200, ingresoPct: 75, egresoPct: 48 },
    { mes: 'Jul', ingreso: 25800, egreso: 16000, ingresoPct: 80, egresoPct: 50 },
    { mes: 'Ago', ingreso: 26500, egreso: 17100, ingresoPct: 82, egresoPct: 53 },
    { mes: 'Sep', ingreso: 27200, egreso: 16400, ingresoPct: 85, egresoPct: 51 },
    { mes: 'Oct', ingreso: 27900, egreso: 15800, ingresoPct: 87, egresoPct: 49 },
    { mes: 'Nov', ingreso: 28450, egreso: 16920, ingresoPct: 90, egresoPct: 52 },
  ];

  // Datos del prototipo para la tabla de unidades y morosidad
  unidadesMock: UnidadMorosidad[] = [
    { unidad: 'Torre A - 101', responsable: 'Carlos Justiniano', alicuota: 4.85, saldo: 0, estado: 'AL_DIA', mesesMora: 0 },
    { unidad: 'Torre A - 202', responsable: 'Mariana Zalles', alicuota: 5.20, saldo: 1480, estado: 'MOROSO', mesesMora: 2 },
    { unidad: 'Torre A - 301', responsable: 'Roberto Vaca', alicuota: 6.15, saldo: 0, estado: 'AL_DIA', mesesMora: 0 },
    { unidad: 'Torre B - 102', responsable: 'Sandra Banegas', alicuota: 4.85, saldo: 740, estado: 'PENDIENTE', mesesMora: 1 },
    { unidad: 'Torre B - 201', responsable: 'Fernando Antelo', alicuota: 5.40, saldo: 3120, estado: 'MOROSO', mesesMora: 4 },
    { unidad: 'Torre B - 302', responsable: 'Gabriela Suárez', alicuota: 5.10, saldo: 0, estado: 'AL_DIA', mesesMora: 0 }
  ];

  get currentMonthYear(): string {
    return 'Noviembre 2026';
  }

  get egresosCalculados(): number {
    return 16920.00;
  }

  get unidadesFiltradas(): UnidadMorosidad[] {
    if (this.filtroEstado === 'TODOS') return this.unidadesMock;
    return this.unidadesMock.filter(u => u.estado === this.filtroEstado);
  }

  ngOnInit() {
    this.loadStats();
    this.listenToRealTime();
  }

  loadStats() {
    this.loading = true;
    this.api.getDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando stats:', err);
        this.loading = false;
      }
    });
  }

  listenToRealTime() {
    const events = ['pago.registrado', 'pago.aprobado', 'expensa.creada', 'visita.registrada', 'dashboard.actualizado'];
    events.forEach(evt => {
      this.subs.push(
        this.socket.fromEvent(evt).subscribe(() => {
          this.loadStats();
        })
      );
    });
  }

  enviarRecordatorio(u: UnidadMorosidad) {
    alert(`Enviando recordatorio de cobranza por WhatsApp a ${u.responsable} (${u.unidad}) por saldo de Bs. ${u.saldo}`);
  }

  openEmitirExpensas() {
    alert('Módulo de Emisión Masiva de Expensas (RF-05): Cálculo automatizado en base a alícuotas catastrales.');
  }

  openRegistrarPagoQR() {
    alert('Módulo de Conciliación QR Simple (RF-07): Verificación de comprobante bancario e integración en tiempo real.');
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
