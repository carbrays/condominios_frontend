import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="page-container">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="page-tag">CONCILIACIÓN Y TESORERÍA</div>
          <h1 class="page-title">Validación y Conciliación de Pagos QR</h1>
          <p class="page-subtitle">Revisión de transferencias bancarias, validación Simple QR y acreditación de expensas</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="cargarPagos()">
            <app-icon name="refresh" [size]="15"></app-icon>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon pending-icon">
            <app-icon name="alert-triangle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Por Validar</span>
            <span class="metric-val text-amber">{{ totalPendientes }}</span>
            <span class="metric-sub">Requieren conciliación</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon approved-icon">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Aprobados</span>
            <span class="metric-val text-emerald">{{ totalAprobados }}</span>
            <span class="metric-sub">Acreditados a cuentas</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon rejected-icon">
            <app-icon name="trash" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Rechazados</span>
            <span class="metric-val text-red">{{ totalRechazados }}</span>
            <span class="metric-sub">Comprobantes inválidos</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon total-icon">
            <app-icon name="receipt" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Monto Acreditado</span>
            <span class="metric-val">Bs. {{ totalMontoAprobado | number:'1.2-2' }}</span>
            <span class="metric-sub">Total validado</span>
          </div>
        </div>
      </div>

      <!-- FILTROS Y BUSCADOR -->
      <div class="filters-card">
        <div class="search-box-container" style="max-width: 420px;">
          <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="filtroTexto" 
            placeholder="Buscar por residente, CI, unidad o referencia..." 
            class="clean-search-input" />
          <button 
            type="button" 
            *ngIf="filtroTexto" 
            (click)="filtroTexto = ''" 
            class="clean-clear-btn" 
            title="Borrar búsqueda">
            ✕
          </button>
        </div>

        <div class="filters-row">
          <select [(ngModel)]="filtroEstado" class="filter-select">
            <option value="TODOS">Estado: Todos</option>
            <option value="PENDIENTE">Estado: Por Validar</option>
            <option value="APROBADO">Estado: Aprobados</option>
            <option value="RECHAZADO">Estado: Rechazados</option>
          </select>

          <select [(ngModel)]="filtroMetodo" class="filter-select">
            <option value="TODOS">Método: Todos</option>
            <option value="QR_SIMPLE">Simple QR</option>
            <option value="TRANSFERENCIA">Transferencia Bancaria</option>
            <option value="DEPOSITO">Depósito</option>
            <option value="EFECTIVO">Efectivo</option>
          </select>
        </div>
      </div>

      <!-- TABLA DE PAGOS -->
      <div class="ui-card">
        <div class="table-container">
          <table class="ui-table">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>RESIDENTE / PAGADOR</th>
                <th>UNIDAD</th>
                <th>MONTO (BS.)</th>
                <th>MÉTODO</th>
                <th>FECHA PAGO</th>
                <th>COMPROBANTE</th>
                <th>ESTADO</th>
                <th style="text-align: right; width: 170px;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagosFiltrados">
                <td>
                  <span class="pago-id">#{{ p.id }}</span>
                </td>
                <td>
                  <div class="resident-box">
                    <span class="resident-name">{{ p.residente_nombre || 'Residente' }}</span>
                    <span class="resident-ci">CI: {{ p.residente_ci || 'No registrado' }}</span>
                  </div>
                </td>
                <td>
                  <span class="unit-badge">Unidad {{ p.unidad_codigo }}</span>
                </td>
                <td>
                  <span class="amount-val">Bs. {{ p.monto | number:'1.2-2' }}</span>
                </td>
                <td>
                  <span class="method-badge">
                    <app-icon name="qr" [size]="12" *ngIf="p.metodo_pago === 'QR_SIMPLE'"></app-icon>
                    <span>{{ p.metodo_pago || 'TRANSFERENCIA' }}</span>
                  </span>
                </td>
                <td>
                  <span class="date-text">{{ p.fecha_pago | date:'dd/MM/yyyy HH:mm' }}</span>
                </td>
                <td>
                  <button class="btn-receipt-view" (click)="verComprobante(p)" *ngIf="p.comprobante_url">
                    <span>📷 Ver Archivo</span>
                  </button>
                  <span class="text-muted" *ngIf="!p.comprobante_url">Sin archivo</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getEstadoBadgeClass(p.estado)">
                    {{ p.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="actions-group" *ngIf="p.estado === 'PENDIENTE'">
                    <button class="btn-approve" (click)="confirmarAprobar(p)" title="Aprobar pago">
                      <app-icon name="check" [size]="13"></app-icon>
                      <span>Aprobar</span>
                    </button>
                    <button class="btn-reject" (click)="abrirModalRechazo(p)" title="Rechazar comprobante">
                      ✕ Rechazar
                    </button>
                  </div>
                  <span class="text-muted" *ngIf="p.estado !== 'PENDIENTE'">Conciliado</span>
                </td>
              </tr>

              <tr *ngIf="pagosFiltrados.length === 0">
                <td colspan="9" class="empty-state">
                  <app-icon name="receipt" [size]="36" customClass="empty-icon"></app-icon>
                  <p class="empty-title">No hay pagos registrados</p>
                  <p class="empty-desc">No se encontraron pagos con los filtros seleccionados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL VER COMPROBANTE -->
      <div class="modal-backdrop" *ngIf="pagoSeleccionado">
        <div class="modal-box modal-lg">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Comprobante de Pago #{{ pagoSeleccionado.id }}</h2>
              <p class="modal-subtitle">Unidad {{ pagoSeleccionado.unidad_codigo }} • Bs. {{ pagoSeleccionado.monto | number:'1.2-2' }}</p>
            </div>
            <button class="modal-close-btn" (click)="pagoSeleccionado = null">✕</button>
          </div>

          <div class="modal-body text-center">
            <div class="receipt-image-container">
              <img [src]="'http://localhost:3000' + pagoSeleccionado.comprobante_url" alt="Comprobante de Pago" class="receipt-img" />
            </div>
            <div class="receipt-meta">
              <div><strong>Pagador:</strong> {{ pagoSeleccionado.residente_nombre }} (CI: {{ pagoSeleccionado.residente_ci }})</div>
              <div><strong>Método:</strong> {{ pagoSeleccionado.metodo_pago }}</div>
              <div><strong>Fecha de Operación:</strong> {{ pagoSeleccionado.fecha_pago | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="pagoSeleccionado = null">Cerrar</button>
            <button class="btn btn-approve" *ngIf="pagoSeleccionado.estado === 'PENDIENTE'" (click)="confirmarAprobar(pagoSeleccionado)">
              Aprobar Pago
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL RECHAZAR PAGO -->
      <div class="modal-backdrop" *ngIf="pagoARechazar">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Rechazar Comprobante de Pago</h2>
              <p class="modal-subtitle">Indica el motivo para notificar al residente</p>
            </div>
            <button class="modal-close-btn" (click)="pagoARechazar = null">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Motivo del Rechazo *</label>
              <textarea 
                [(ngModel)]="motivoRechazo" 
                rows="3" 
                placeholder="Ej. Comprobante ilegible, monto no coincide con la expensa, transferencia no encontrada en cuenta bancaria..." 
                class="form-control"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="pagoARechazar = null">Cancelar</button>
            <button class="btn btn-danger" (click)="ejecutarRechazo()" [disabled]="!motivoRechazo.trim()">
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .page-tag {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 4px;
    }

    .page-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    /* KPI METRICS */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
    }

    .metric-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pending-icon { background: #fef3c7; color: #b45309; }
    .approved-icon { background: #ecfdf5; color: #059669; }
    .rejected-icon { background: #fee2e2; color: #dc2626; }
    .total-icon { background: #f1f5f9; color: #475569; }

    .metric-content {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }

    .metric-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    .metric-sub {
      font-size: 11px;
      color: #94a3b8;
    }

    .text-amber { color: #b45309; }
    .text-emerald { color: #059669; }
    .text-red { color: #dc2626; }

    /* FILTERS CARD */
    .filters-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      align-items: center;
      justify-content: space-between;
    }

    .filters-row {
      display: flex;
      gap: 10px;
    }

    .filter-select {
      height: 38px;
      padding: 0 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #334155;
      background: #f8fafc;
      outline: none;
    }

    .pago-id {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      background: #f1f5f9;
      padding: 3px 6px;
      border-radius: 4px;
    }

    .resident-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .resident-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .resident-ci {
      font-size: 11px;
      color: #64748b;
    }

    .unit-badge {
      font-size: 12px;
      font-weight: 700;
      color: #065f46;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .amount-val {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
    }

    .method-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      font-weight: 600;
      color: #334155;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .date-text {
      font-size: 12px;
      color: #475569;
    }

    .btn-receipt-view {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      color: #0284c7;
      cursor: pointer;
    }

    .btn-receipt-view:hover {
      background: #e0f2fe;
    }

    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }

    .actions-group {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }

    .btn-approve {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .btn-approve:hover {
      background: #047857;
    }

    .btn-reject {
      background: #ffffff;
      color: #dc2626;
      border: 1px solid #fee2e2;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-reject:hover {
      background: #fee2e2;
    }

    .btn-danger {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }

    .receipt-image-container {
      max-height: 420px;
      overflow: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #0f172a;
      display: flex;
      justify-content: center;
    }

    .receipt-img {
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }

    .receipt-meta {
      background: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      font-size: 12.5px;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* MODALES */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .modal-box {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 520px;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }

    .modal-lg { max-width: 680px; }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .modal-title { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; }
    .modal-subtitle { font-size: 12.5px; color: #64748b; margin: 4px 0 0; }
    .modal-close-btn { background: transparent; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; }
    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
    .modal-footer { padding: 14px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 12.5px; font-weight: 700; color: #334155; }
    .form-control { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; }

    .empty-state { text-align: center; padding: 40px 20px; }
    .empty-icon { color: #cbd5e1; margin-bottom: 8px; }
    .empty-title { font-size: 15px; font-weight: 700; color: #334155; margin: 0 0 4px; }
    .empty-desc { font-size: 13px; color: #94a3b8; margin: 0; }
  `]
})
export class PagosComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  pagos: any[] = [];
  filtroTexto: string = '';
  filtroEstado: string = 'TODOS';
  filtroMetodo: string = 'TODOS';

  pagoSeleccionado: any = null;
  pagoARechazar: any = null;
  motivoRechazo: string = '';

  ngOnInit() {
    this.cargarPagos();
  }

  cargarPagos() {
    this.api.getPagos().subscribe({
      next: (d) => this.pagos = d.items || [],
      error: (err) => console.error(err)
    });
  }

  get totalPendientes(): number {
    return this.pagos.filter(p => p.estado === 'PENDIENTE').length;
  }

  get totalAprobados(): number {
    return this.pagos.filter(p => p.estado === 'APROBADO').length;
  }

  get totalRechazados(): number {
    return this.pagos.filter(p => p.estado === 'RECHAZADO').length;
  }

  get totalMontoAprobado(): number {
    return this.pagos
      .filter(p => p.estado === 'APROBADO')
      .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
  }

  get pagosFiltrados(): any[] {
    return this.pagos.filter(p => {
      if (this.filtroEstado !== 'TODOS' && p.estado !== this.filtroEstado) return false;
      if (this.filtroMetodo !== 'TODOS' && p.metodo_pago !== this.filtroMetodo) return false;
      if (this.filtroTexto.trim()) {
        const q = this.filtroTexto.toLowerCase();
        const coincideRes = p.residente_nombre?.toLowerCase().includes(q);
        const coincideCi = p.residente_ci?.toLowerCase().includes(q);
        const coincideUni = p.unidad_codigo?.toLowerCase().includes(q);
        if (!coincideRes && !coincideCi && !coincideUni) return false;
      }
      return true;
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'badge-success';
      case 'RECHAZADO': return 'badge-danger';
      case 'PENDIENTE': return 'badge-warning';
      default: return 'badge-warning';
    }
  }

  verComprobante(p: any) {
    this.pagoSeleccionado = p;
  }

  async confirmarAprobar(p: any) {
    const ok = await this.confirm.confirm({
      title: '¿Aprobar pago de expensas?',
      message: `Acreditarás <strong>Bs. ${p.monto}</strong> para la <strong>Unidad ${p.unidad_codigo}</strong> (${p.residente_nombre}). El saldo de la expensa se actualizará de inmediato.`,
      confirmText: 'Sí, aprobar',
      cancelText: 'Mantener',
      type: 'info',
      icon: 'check-circle'
    });

    if (ok) {
      this.api.validarPago(p.id, 'APROBAR').subscribe({
        next: () => {
          this.pagoSeleccionado = null;
          this.cargarPagos();
        },
        error: (err) => alert(err.error?.message || 'Error al aprobar el pago')
      });
    }
  }

  abrirModalRechazo(p: any) {
    this.pagoARechazar = p;
    this.motivoRechazo = '';
  }

  ejecutarRechazo() {
    if (!this.pagoARechazar || !this.motivoRechazo.trim()) return;

    this.api.validarPago(this.pagoARechazar.id, 'RECHAZAR', this.motivoRechazo.trim()).subscribe({
      next: () => {
        this.pagoARechazar = null;
        this.cargarPagos();
      },
      error: (err) => alert(err.error?.message || 'Error al rechazar el pago')
    });
  }
}
