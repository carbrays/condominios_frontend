import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="page-container">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="page-tag">ADMINISTRACIÓN FINANCIERA</div>
          <h1 class="page-title">Gestión de Expensas y Finanzas</h1>
          <p class="page-subtitle">Facturación mensual, prorrateo por alícuotas, cuotas extraordinarias y control de mora</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="cargarExpensas()">
            <app-icon name="refresh" [size]="15"></app-icon>
            <span>Actualizar</span>
          </button>
          <button class="btn btn-primary" (click)="abrirModalGenerar()">
            <app-icon name="receipt" [size]="16"></app-icon>
            <span>⚡ Generar Expensas Masivas</span>
          </button>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon total-icon">
            <app-icon name="receipt" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Total Facturado</span>
            <span class="metric-val">Bs. {{ totalFacturado | number:'1.2-2' }}</span>
            <span class="metric-sub">{{ expensas.length }} expensas generadas</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon paid-icon">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Recaudación Cobrada</span>
            <span class="metric-val text-emerald">Bs. {{ totalCobrado | number:'1.2-2' }}</span>
            <span class="metric-sub">Fondos acreditados</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon mora-icon">
            <app-icon name="alert-triangle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Mora Pendiente</span>
            <span class="metric-val text-red">Bs. {{ totalPendiente | number:'1.2-2' }}</span>
            <span class="metric-sub">{{ totalEnMora }} unidades con deuda</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon rate-icon">
            <app-icon name="arrow-up-right" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">% Cumplimiento</span>
            <span class="metric-val text-emerald">{{ porcentajeCumplimiento }}%</span>
            <span class="metric-sub">Efectividad de cobro</span>
          </div>
        </div>
      </div>

      <!-- FILTROS Y BUSCADOR -->
      <div class="filters-card">
        <div class="search-box-container" style="max-width: 400px;">
          <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="filtroTexto" 
            placeholder="Buscar por unidad, concepto o periodo..." 
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
            <option value="PAGADO">Pagado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_MORA">En Mora</option>
          </select>
        </div>
      </div>

      <!-- TABLA DE EXPENSAS -->
      <div class="ui-card">
        <div class="table-container">
          <table class="ui-table">
            <thead>
              <tr>
                <th>PERIODO</th>
                <th>UNIDAD</th>
                <th>CONCEPTO</th>
                <th>MONTO BASE</th>
                <th>RECARGO MORA</th>
                <th>TOTAL FACTURADO</th>
                <th>SALDO PENDIENTE</th>
                <th>VENCIMIENTO</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of expensasFiltradas">
                <td>
                  <span class="periodo-badge">{{ e.periodo }}</span>
                </td>
                <td>
                  <span class="unit-badge">Unidad {{ e.unidad_codigo }}</span>
                </td>
                <td>
                  <span class="concepto-text">{{ e.concepto_nombre || 'Expensa Ordinaria Mensual' }}</span>
                </td>
                <td>
                  <span class="amount-text">Bs. {{ e.monto_base | number:'1.2-2' }}</span>
                </td>
                <td>
                  <span class="mora-text" [class.text-red]="e.monto_mora > 0">
                    Bs. {{ (e.monto_mora || 0) | number:'1.2-2' }}
                  </span>
                </td>
                <td>
                  <span class="total-text">Bs. {{ e.monto_total | number:'1.2-2' }}</span>
                </td>
                <td>
                  <span class="pending-text font-bold" [class.text-red]="e.saldo_pendiente > 0">
                    Bs. {{ (e.saldo_pendiente || 0) | number:'1.2-2' }}
                  </span>
                </td>
                <td>
                  <span class="date-text">{{ e.fecha_vencimiento | date:'dd/MM/yyyy' }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getEstadoBadgeClass(e.estado)">
                    {{ e.estado }}
                  </span>
                </td>
              </tr>

              <tr *ngIf="expensasFiltradas.length === 0">
                <td colspan="9" class="empty-state">
                  <app-icon name="receipt" [size]="36" customClass="empty-icon"></app-icon>
                  <p class="empty-title">No hay expensas emitidas</p>
                  <p class="empty-desc">Genera el primer periodo masivo de expensas para las unidades del condominio.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL GENERAR EXPENSAS MASIVAS -->
      <div class="modal-backdrop" *ngIf="mostrarModalGenerar">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Generación Masiva de Expensas</h2>
              <p class="modal-subtitle">Emisión simultánea de recibos y cargos para todas las unidades</p>
            </div>
            <button class="modal-close-btn" (click)="mostrarModalGenerar = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Periodo (YYYY-MM) *</label>
                <input 
                  type="text" 
                  [(ngModel)]="genData.periodo" 
                  placeholder="Ej. 2026-11" 
                  class="form-control" />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Fecha de Vencimiento *</label>
                <input 
                  type="date" 
                  [(ngModel)]="genData.fecha_vencimiento" 
                  class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Criterio de Cálculo *</label>
              <select [(ngModel)]="genData.tipo_calculo" class="form-control">
                <option value="ALICUOTA">Prorrateo por Alícuota (Ley de Propiedad Horizontal)</option>
                <option value="MONTO_FIJO">Monto Fijo Uniforme por Unidad</option>
              </select>
            </div>

            <div class="form-group" *ngIf="genData.tipo_calculo === 'ALICUOTA'">
              <label class="form-label">Presupuesto Operativo Total a Distribuir (Bs.) *</label>
              <input 
                type="number" 
                [(ngModel)]="genData.presupuesto_total" 
                placeholder="Ej. 25000" 
                class="form-control" />
              <small class="form-hint">Cada unidad pagará exactamente: (Alícuota × Presupuesto Total) / 100%</small>
            </div>

            <div class="form-group" *ngIf="genData.tipo_calculo === 'MONTO_FIJO'">
              <label class="form-label">Monto Fijo por Unidad (Bs.) *</label>
              <input 
                type="number" 
                [(ngModel)]="genData.monto_base" 
                placeholder="Ej. 450" 
                class="form-control" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="mostrarModalGenerar = false">Cancelar</button>
            <button 
              class="btn btn-primary" 
              (click)="confirmarGeneracion()" 
              [disabled]="!genData.periodo || !genData.fecha_vencimiento">
              <app-icon name="receipt" [size]="15"></app-icon>
              <span>Emitir Expensas</span>
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

    .total-icon { background: #f1f5f9; color: #475569; }
    .paid-icon { background: #ecfdf5; color: #059669; }
    .mora-icon { background: #fee2e2; color: #dc2626; }
    .rate-icon { background: #e0f2fe; color: #0284c7; }

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

    .text-emerald { color: #059669; }
    .text-red { color: #dc2626; }

    /* FILTROS */
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
      color: #334155;
      background: #f8fafc;
      outline: none;
    }

    .periodo-badge {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
      color: #1e3a8a;
      background: #eff6ff;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .unit-badge {
      font-size: 12px;
      font-weight: 700;
      color: #065f46;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .concepto-text {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .amount-text, .total-text {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .mora-text, .pending-text {
      font-size: 13px;
    }

    .date-text {
      font-size: 12px;
      color: #64748b;
    }

    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }

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
    .form-row { display: flex; gap: 12px; }
    .flex-1 { flex: 1; }
    .form-label { font-size: 12.5px; font-weight: 700; color: #334155; }
    .form-control { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; }
    .form-hint { font-size: 11px; color: #059669; font-weight: 600; }

    .empty-state { text-align: center; padding: 40px 20px; }
    .empty-icon { color: #cbd5e1; margin-bottom: 8px; }
    .empty-title { font-size: 15px; font-weight: 700; color: #334155; margin: 0 0 4px; }
    .empty-desc { font-size: 13px; color: #94a3b8; margin: 0; }
    .font-bold { font-weight: 700; }
  `]
})
export class FinanzasComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  expensas: any[] = [];
  filtroTexto: string = '';
  filtroEstado: string = 'TODOS';

  mostrarModalGenerar = false;
  genData: any = {
    periodo: '2026-11',
    tipo_calculo: 'ALICUOTA',
    monto_base: 450,
    presupuesto_total: 25000,
    fecha_vencimiento: '2026-11-30'
  };

  ngOnInit() {
    this.cargarExpensas();
  }

  cargarExpensas() {
    this.api.getExpensas().subscribe({
      next: (d) => this.expensas = d.items || [],
      error: (err) => console.error(err)
    });
  }

  get totalFacturado(): number {
    return this.expensas.reduce((acc, e) => acc + parseFloat(e.monto_total || 0), 0);
  }

  get totalCobrado(): number {
    return this.expensas.reduce((acc, e) => {
      const pagado = parseFloat(e.monto_total || 0) - parseFloat(e.saldo_pendiente || 0);
      return acc + (pagado > 0 ? pagado : 0);
    }, 0);
  }

  get totalPendiente(): number {
    return this.expensas.reduce((acc, e) => acc + parseFloat(e.saldo_pendiente || 0), 0);
  }

  get totalEnMora(): number {
    return this.expensas.filter(e => e.estado === 'EN_MORA' || (parseFloat(e.saldo_pendiente || 0) > 0)).length;
  }

  get porcentajeCumplimiento(): number {
    if (!this.totalFacturado) return 100;
    const pct = (this.totalCobrado / this.totalFacturado) * 100;
    return Math.round(pct);
  }

  get expensasFiltradas(): any[] {
    return this.expensas.filter(e => {
      if (this.filtroEstado !== 'TODOS' && e.estado !== this.filtroEstado) return false;
      if (this.filtroTexto.trim()) {
        const q = this.filtroTexto.toLowerCase();
        const coincideUni = e.unidad_codigo?.toLowerCase().includes(q);
        const coincidePer = e.periodo?.toLowerCase().includes(q);
        const coincideCon = e.concepto_nombre?.toLowerCase().includes(q);
        if (!coincideUni && !coincidePer && !coincideCon) return false;
      }
      return true;
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PAGADO': return 'badge-success';
      case 'EN_MORA': return 'badge-danger';
      case 'PENDIENTE': return 'badge-warning';
      default: return 'badge-warning';
    }
  }

  abrirModalGenerar() {
    this.mostrarModalGenerar = true;
  }

  async confirmarGeneracion() {
    const ok = await this.confirm.confirm({
      title: '¿Generar expensas del periodo?',
      message: `Se emitirán los recibos de expensas para todas las unidades activas correspondientes al periodo <strong>${this.genData.periodo}</strong> con vencimiento el <strong>${this.genData.fecha_vencimiento}</strong>.`,
      confirmText: 'Sí, generar masivamente',
      cancelText: 'Mantener',
      type: 'info',
      icon: 'receipt'
    });

    if (ok) {
      this.api.generarExpensasMasivas(this.genData).subscribe({
        next: () => {
          this.mostrarModalGenerar = false;
          this.cargarExpensas();
        },
        error: (err) => alert(err.error?.message || 'Error generando expensas masivas')
      });
    }
  }
}
