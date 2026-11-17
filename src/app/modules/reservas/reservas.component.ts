import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Áreas Comunes y Reservas</h1>
          <p>Supervisión de parrillero, salón social, piscina y canchas</p>
        </div>
      </div>

      <div class="grid-areas">
        <div class="area-card" *ngFor="let a of areas">
          <div class="area-icon">🏊</div>
          <div class="area-details">
            <h3>{{ a.nombre }}</h3>
            <p>{{ a.descripcion }}</p>
            <div class="area-meta">
              <span>Capacidad: <strong>{{ a.capacidad_maxima }} pers.</strong></span>
              <span>Costo: <strong>Bs. {{ a.costo_reserva | number:'1.2-2' }}</strong></span>
              <span>Horario: <strong>{{ a.hora_inicio }} - {{ a.hora_fin }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="card-header">
          <h3>📅 Reservas Registradas</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Área Común</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Unidad Solicitante</th>
              <th>Residente</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of reservas">
              <td class="font-bold">{{ r.area_nombre }}</td>
              <td>{{ r.fecha_reserva }}</td>
              <td>{{ r.hora_inicio }} - {{ r.hora_fin }}</td>
              <td>{{ r.unidad_codigo }}</td>
              <td>{{ r.solicitante_nombre }}</td>
              <td>
                <span class="badge" [ngClass]="r.estado === 'CONFIRMADA' ? 'badge-success' : 'badge-danger'">
                  {{ r.estado }}
                </span>
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
    .grid-areas { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
    .area-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; gap: 16px; align-items: center; }
    .area-icon { font-size: 36px; background: #e0f2fe; width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .area-details h3 { margin: 0; font-size: 16px; color: #0f172a; }
    .area-details p { margin: 4px 0 8px; font-size: 12px; color: #64748b; }
    .area-meta { display: flex; gap: 12px; font-size: 11px; color: #334155; }
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .card-header { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
    .card-header h3 { margin: 0; font-size: 15px; color: #1e293b; font-weight: 700; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 12px 16px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .font-bold { font-weight: 700; color: #0f172a; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
  `]
})
export class ReservasComponent implements OnInit {
  private api = inject(ApiService);
  areas: any[] = [];
  reservas: any[] = [];

  ngOnInit() {
    this.api.getAreasComunes().subscribe({ next: (d) => this.areas = d || [] });
    this.api.getReservas().subscribe({ next: (d) => this.reservas = d.items || [] });
  }
}
