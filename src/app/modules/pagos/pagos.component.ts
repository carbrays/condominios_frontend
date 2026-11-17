import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Pago } from '../../core/models/models';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Validación y Conciliación de Pagos</h1>
          <p>Revisión de comprobantes de transferencia y aprobación en tiempo real</p>
        </div>
      </div>

      <!-- TABLA DE PAGOS -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Residente</th>
              <th>Unidad</th>
              <th>Monto (Bs.)</th>
              <th>Fecha de Pago</th>
              <th>Método</th>
              <th>Comprobante</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of pagos">
              <td>#{{ p.id }}</td>
              <td class="font-bold">{{ p.residente_nombre }} <br><small>CI: {{ p.residente_ci }}</small></td>
              <td>{{ p.unidad_codigo }}</td>
              <td class="font-bold">Bs. {{ p.monto | number:'1.2-2' }}</td>
              <td>{{ p.fecha_pago }}</td>
              <td><span class="badge badge-tipo">{{ p.metodo_pago }}</span></td>
              <td>
                <a *ngIf="p.comprobante_url" [href]="'http://localhost:3000' + p.comprobante_url" target="_blank" class="btn-link">
                  📷 Ver Archivo
                </a>
                <span *ngIf="!p.comprobante_url" class="text-muted">Sin archivo</span>
              </td>
              <td>
                <span class="badge" [ngClass]="p.estado === 'APROBADO' ? 'badge-success' : (p.estado === 'RECHAZADO' ? 'badge-danger' : 'badge-warning')">
                  {{ p.estado }}
                </span>
              </td>
              <td>
                <div class="action-buttons" *ngIf="p.estado === 'PENDIENTE'">
                  <button class="btn-approve" (click)="validar(p.id, 'APROBAR')">Aprobar</button>
                  <button class="btn-reject" (click)="validar(p.id, 'RECHAZAR')">Rechazar</button>
                </div>
                <span *ngIf="p.estado !== 'PENDIENTE'" class="text-muted">Procesado</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 20px; }
    .page-header h1 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 800; }
    .page-header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 14px 16px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .font-bold { font-weight: 700; color: #0f172a; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .badge-tipo { background: #f1f5f9; color: #475569; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .btn-link { color: #1e3a8a; font-weight: 600; text-decoration: underline; cursor: pointer; }
    .text-muted { color: #94a3b8; font-size: 12px; }
    .action-buttons { display: flex; gap: 6px; }
    .btn-approve { background: #16a34a; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .btn-reject { background: #dc2626; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }
  `]
})
export class PagosComponent implements OnInit {
  private api = inject(ApiService);
  pagos: Pago[] = [];

  ngOnInit() {
    this.cargarPagos();
  }

  cargarPagos() {
    this.api.getPagos().subscribe({
      next: (data) => this.pagos = data.items || []
    });
  }

  validar(id: number, accion: 'APROBAR' | 'RECHAZAR') {
    const motivo = accion === 'RECHAZAR' ? 'Comprobante ilegible o transferencia no reflejada' : undefined;
    this.api.validarPago(id, accion, motivo).subscribe({
      next: () => this.cargarPagos()
    });
  }
}
