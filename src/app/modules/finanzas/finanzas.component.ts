import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Expensa } from '../../core/models/models';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestión Financiera y Expensas</h1>
          <p>Generación mensual, cálculo por alícuotas o monto fijo y estados de cuenta</p>
        </div>
        <button class="btn-primary" (click)="showModal = true">⚡ Generar Expensas Masivas</button>
      </div>

      <!-- LISTA DE EXPENSAS -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Unidad</th>
              <th>Concepto</th>
              <th>Base</th>
              <th>Mora</th>
              <th>Total Facturado</th>
              <th>Saldo Pendiente</th>
              <th>Vencimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of expensas">
              <td class="font-bold">{{ e.periodo }}</td>
              <td>{{ e.unidad_codigo }}</td>
              <td>{{ e.concepto_nombre || 'Expensa Ordinaria' }}</td>
              <td>Bs. {{ e.monto_base | number:'1.2-2' }}</td>
              <td [class.text-red]="e.monto_mora > 0">Bs. {{ e.monto_mora | number:'1.2-2' }}</td>
              <td class="font-bold">Bs. {{ e.monto_total | number:'1.2-2' }}</td>
              <td [class.text-red]="e.saldo_pendiente > 0" class="font-bold">
                Bs. {{ e.saldo_pendiente | number:'1.2-2' }}
              </td>
              <td>{{ e.fecha_vencimiento }}</td>
              <td>
                <span class="badge" [ngClass]="e.estado === 'PAGADO' ? 'badge-success' : (e.estado === 'EN_MORA' ? 'badge-danger' : 'badge-warning')">
                  {{ e.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL GENERAR EXPENSAS -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-content">
          <h3>Generación Masiva de Expensas</h3>
          <div class="form-group">
            <label>Periodo (YYYY-MM)</label>
            <input type="text" [(ngModel)]="genData.periodo">
          </div>
          <div class="form-group">
            <label>Criterio de Cálculo</label>
            <select [(ngModel)]="genData.tipo_calculo">
              <option value="MONTO_FIJO">Monto Fijo por Unidad</option>
              <option value="ALICUOTA">Prorrateo por Alícuota</option>
            </select>
          </div>
          <div class="form-group" *ngIf="genData.tipo_calculo === 'MONTO_FIJO'">
            <label>Monto Base por Unidad (Bs.)</label>
            <input type="number" [(ngModel)]="genData.monto_base">
          </div>
          <div class="form-group" *ngIf="genData.tipo_calculo === 'ALICUOTA'">
            <label>Presupuesto Total a Prorratear (Bs.)</label>
            <input type="number" [(ngModel)]="genData.presupuesto_total">
          </div>
          <div class="form-group">
            <label>Fecha de Vencimiento</label>
            <input type="date" [(ngModel)]="genData.fecha_vencimiento">
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showModal = false">Cancelar</button>
            <button class="btn-primary" (click)="ejecutarGeneracion()">Generar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h1 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 800; }
    .page-header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
    .btn-primary { background: #1e3a8a; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 14px 16px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .font-bold { font-weight: 700; color: #0f172a; }
    .text-red { color: #dc2626; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
    .modal-content { background: #fff; width: 100%; max-width: 440px; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .modal-content h3 { margin: 0; font-size: 18px; color: #0f172a; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #475569; }
    .form-group input, .form-group select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
  `]
})
export class FinanzasComponent implements OnInit {
  private api = inject(ApiService);
  expensas: Expensa[] = [];
  showModal = false;

  genData = {
    periodo: '2026-12',
    tipo_calculo: 'MONTO_FIJO',
    monto_base: 450,
    presupuesto_total: 10000,
    fecha_vencimiento: '2026-12-10'
  };

  ngOnInit() {
    this.cargarExpensas();
  }

  cargarExpensas() {
    this.api.getExpensas().subscribe({
      next: (data) => this.expensas = data.items || []
    });
  }

  ejecutarGeneracion() {
    this.api.generarExpensas(this.genData).subscribe({
      next: () => {
        this.showModal = false;
        this.cargarExpensas();
      }
    });
  }
}
