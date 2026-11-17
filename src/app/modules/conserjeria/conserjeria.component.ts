import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-conserjeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Conserjería y Control de Acceso</h1>
          <p>Monitoreo de ingresos, paquetería y validador de pases QR</p>
        </div>
      </div>

      <!-- ESCANEO / VALIDACIÓN QR -->
      <div class="qr-validator-card">
        <h3>🔍 Validador Rápido de Pases QR</h3>
        <div class="qr-input-row">
          <input type="text" [(ngModel)]="codigoQR" placeholder="Pegue o ingrese el código seguro del pase QR..." (keyup.enter)="validarQR()">
          <button class="btn-primary" (click)="validarQR()">Validar Acceso</button>
        </div>

        <div *ngIf="qrResultado" class="qr-result" [ngClass]="qrResultado.valido ? 'success' : 'error'">
          <strong>{{ qrResultado.valido ? '✅ ACCESO AUTORIZADO' : '❌ ACCESO DENEGADO' }}</strong>
          <p>{{ qrResultado.mensaje }}</p>
          <div *ngIf="qrResultado.pase" class="pase-info">
            <span><strong>Visitante:</strong> {{ qrResultado.pase.nombre_visitante }}</span>
            <span><strong>Destino:</strong> {{ qrResultado.pase.unidad_codigo }}</span>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- VISITAS ACTIVAS -->
        <div class="table-card">
          <div class="card-header">
            <h3>👥 Visitas Actualmente en el Edificio</h3>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Doc / CI</th>
                <th>Destino</th>
                <th>Ingreso</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of visitas">
                <td class="font-bold">{{ v.visitante_nombre }}</td>
                <td>{{ v.visitante_documento }}</td>
                <td><span class="badge">{{ v.unidad_codigo }}</span></td>
                <td>{{ v.fecha_entrada | date:'shortTime' }}</td>
              </tr>
              <tr *ngIf="visitas.length === 0">
                <td colspan="4" class="text-center">No hay visitas activas en este momento</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAQUETERÍA -->
        <div class="table-card">
          <div class="card-header">
            <h3>📦 Paquetes en Recepción</h3>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Destinatario</th>
                <th>Unidad</th>
                <th>Transporte</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of paquetes">
                <td class="font-bold">{{ p.destinatario_nombre }}</td>
                <td><span class="badge">{{ p.unidad_codigo }}</span></td>
                <td>{{ p.empresa_transporte || 'Particular' }}</td>
                <td><span class="badge badge-warning">{{ p.estado }}</span></td>
              </tr>
              <tr *ngIf="paquetes.length === 0">
                <td colspan="4" class="text-center">No hay paquetes pendientes de entrega</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 20px; }
    .page-header h1 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 800; }
    .page-header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
    .qr-validator-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 12px; }
    .qr-validator-card h3 { margin: 0; font-size: 16px; color: #1e3a8a; }
    .qr-input-row { display: flex; gap: 10px; }
    .qr-input-row input { flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; }
    .btn-primary { background: #1e3a8a; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .qr-result { padding: 14px; border-radius: 8px; margin-top: 8px; }
    .qr-result.success { background: #dcfce7; border-left: 4px solid #16a34a; color: #166534; }
    .qr-result.error { background: #fee2e2; border-left: 4px solid #dc2626; color: #991b1b; }
    .pase-info { display: flex; gap: 20px; margin-top: 6px; font-size: 13px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 18px; }
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card-header { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
    .card-header h3 { margin: 0; font-size: 15px; color: #1e293b; font-weight: 700; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 12px 16px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .font-bold { font-weight: 700; color: #0f172a; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; background: #f1f5f9; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .text-center { text-align: center; color: #94a3b8; padding: 24px 0; }
  `]
})
export class ConserjeriaComponent implements OnInit {
  private api = inject(ApiService);
  visitas: any[] = [];
  paquetes: any[] = [];
  codigoQR = '';
  qrResultado: any = null;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getVisitas().subscribe({ next: (d) => this.visitas = d.items || [] });
    this.api.getPaqueteria().subscribe({ next: (d) => this.paquetes = d.items || [] });
  }

  validarQR() {
    if (!this.codigoQR.trim()) return;
    this.api.validarQR(this.codigoQR.trim()).subscribe({
      next: (res) => {
        this.qrResultado = res;
        this.cargarDatos();
      },
      error: (err) => {
        this.qrResultado = { valido: false, mensaje: err.error?.message || 'Código QR inválido o expirado' };
      }
    });
  }
}
