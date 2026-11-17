import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';
import { DashboardStats } from '../../core/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Panel de Control Administrativo</h1>
          <p>Supervisión en tiempo real del condominio • Periodo {{ stats?.periodo || 'Actual' }}</p>
        </div>
        <button class="btn-refresh" (click)="loadStats()">🔄 Actualizar Datos</button>
      </div>

      <!-- KPIS OPERATIVOS Y FINANCIEROS -->
      <div class="metrics-grid">
        <!-- Tarjeta 1: Recaudación -->
        <div class="metric-card">
          <div class="card-icon green">💵</div>
          <div class="card-content">
            <span class="card-label">Cobrado este Mes</span>
            <h2 class="card-value">Bs. {{ stats?.finanzas?.cobrado | number:'1.2-2' }}</h2>
            <span class="card-sub">de Bs. {{ stats?.finanzas?.total_facturado | number:'1.2-2' }} facturados</span>
          </div>
        </div>

        <!-- Tarjeta 2: Pendiente / Mora -->
        <div class="metric-card">
          <div class="card-icon red">⚠️</div>
          <div class="card-content">
            <span class="card-label">Saldo Pendiente / Mora</span>
            <h2 class="card-value text-red">Bs. {{ stats?.finanzas?.pendiente | number:'1.2-2' }}</h2>
            <span class="card-sub">{{ stats?.finanzas?.unidades_en_mora || 0 }} unidades en mora</span>
          </div>
        </div>

        <!-- Tarjeta 3: Ocupación de Unidades -->
        <div class="metric-card">
          <div class="card-icon blue">🚪</div>
          <div class="card-content">
            <span class="card-label">Ocupación Habitacional</span>
            <h2 class="card-value">{{ stats?.unidades?.ocupadas || 0 }} / {{ stats?.unidades?.total || 0 }}</h2>
            <span class="card-sub">{{ stats?.unidades?.disponibles || 0 }} unidades disponibles</span>
          </div>
        </div>

        <!-- Tarjeta 4: Fondo de Reserva -->
        <div class="metric-card">
          <div class="card-icon purple">🏦</div>
          <div class="card-content">
            <span class="card-label">Fondo de Reserva Total</span>
            <h2 class="card-value">Bs. {{ stats?.finanzas?.fondo_reserva | number:'1.2-2' }}</h2>
            <span class="card-sub">Reserva de contingencia</span>
          </div>
        </div>
      </div>

      <!-- OPERACIONES ACTIVAS EN VIVO -->
      <div class="operations-grid">
        <div class="panel">
          <div class="panel-header">
            <h3>🛡️ Portería y Accesos en Vivo</h3>
          </div>
          <div class="panel-body">
            <div class="op-stat">
              <span class="stat-num">{{ stats?.operaciones?.visitas_en_curso || 0 }}</span>
              <span class="stat-text">Visitas activas actualmente dentro del condominio</span>
            </div>
            <p class="live-indicator">🟢 Sincronizado vía Socket.IO en tiempo real</p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3>🛠️ Novedades e Incidencias</h3>
          </div>
          <div class="panel-body">
            <div class="op-stat">
              <span class="stat-num text-orange">{{ stats?.operaciones?.incidencias_pendientes || 0 }}</span>
              <span class="stat-text">Averías o reportes pendientes de resolución</span>
            </div>
            <p class="live-indicator">🟢 Notificaciones activadas</p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3>📅 Reservas de Áreas Hoy</h3>
          </div>
          <div class="panel-body">
            <div class="op-stat">
              <span class="stat-num text-teal">{{ stats?.operaciones?.reservas_hoy || 0 }}</span>
              <span class="stat-text">Áreas comunes reservadas para la fecha</span>
            </div>
            <p class="live-indicator">🟢 Control de solapamiento estricto</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h1 { margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; }
    .page-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .btn-refresh { padding: 8px 16px; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover { background: #f1f5f9; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
    .metric-card { background: #fff; padding: 22px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .card-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px; }
    .card-icon.green { background: #dcfce7; }
    .card-icon.red { background: #fee2e2; }
    .card-icon.blue { background: #e0f2fe; }
    .card-icon.purple { background: #f3e8ff; }
    .card-content { display: flex; flex-direction: column; }
    .card-label { font-size: 13px; font-weight: 600; color: #64748b; }
    .card-value { margin: 4px 0 2px; font-size: 22px; font-weight: 800; color: #0f172a; }
    .card-value.text-red { color: #dc2626; }
    .card-sub { font-size: 12px; color: #94a3b8; }
    .operations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; }
    .panel { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .panel-header { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
    .panel-header h3 { margin: 0; font-size: 15px; color: #1e293b; font-weight: 700; }
    .panel-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .op-stat { display: flex; align-items: baseline; gap: 12px; }
    .stat-num { font-size: 36px; font-weight: 800; color: #1e3a8a; }
    .stat-num.text-orange { color: #ea580c; }
    .stat-num.text-teal { color: #0d9488; }
    .stat-text { font-size: 14px; color: #475569; font-weight: 500; }
    .live-indicator { font-size: 12px; font-weight: 600; color: #16a34a; margin: 0; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private socket = inject(SocketService);

  stats: DashboardStats | null = null;
  private subs: Subscription[] = [];

  ngOnInit() {
    this.loadStats();
    this.listenToRealTime();
  }

  loadStats() {
    this.api.getDashboard().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error cargando stats:', err)
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

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
