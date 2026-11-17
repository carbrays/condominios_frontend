import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestión de Incidencias y Mantenimiento</h1>
          <p>Tickets de averías, reparaciones, estado de resolución y técnicos asignados</p>
        </div>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título y Descripción</th>
              <th>Categoría</th>
              <th>Prioridad</th>
              <th>Ubicación / Unidad</th>
              <th>Reportado Por</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inc of incidencias">
              <td>#{{ inc.id }}</td>
              <td>
                <strong class="font-bold">{{ inc.titulo }}</strong>
                <p class="desc">{{ inc.descripcion }}</p>
              </td>
              <td><span class="badge">{{ inc.categoria }}</span></td>
              <td>
                <span class="badge" [ngClass]="inc.prioridad === 'URGENTE' ? 'badge-danger' : 'badge-warning'">
                  {{ inc.prioridad }}
                </span>
              </td>
              <td>{{ inc.unidad_codigo || inc.ubicacion || 'Área Común' }}</td>
              <td>{{ inc.reportado_por_nombre }}</td>
              <td>
                <span class="badge" [ngClass]="inc.estado === 'RESUELTO' ? 'badge-success' : 'badge-warning'">
                  {{ inc.estado }}
                </span>
              </td>
              <td>
                <button *ngIf="inc.estado !== 'RESUELTO'" class="btn-resolve" (click)="resolver(inc.id)">
                  Marcar Resuelto
                </button>
                <span *ngIf="inc.estado === 'RESUELTO'" class="text-muted">Finalizado</span>
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
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 12px 16px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .font-bold { font-weight: 700; color: #0f172a; }
    .desc { margin: 4px 0 0; font-size: 12px; color: #64748b; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; background: #f1f5f9; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .btn-resolve { background: #16a34a; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .text-muted { color: #94a3b8; font-size: 12px; }
  `]
})
export class IncidenciasComponent implements OnInit {
  private api = inject(ApiService);
  incidencias: any[] = [];

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.api.getIncidencias().subscribe({ next: (d) => this.incidencias = d.items || [] });
  }

  resolver(id: number) {
    this.api.actualizarEstadoIncidencia(id, 'RESUELTO').subscribe({
      next: () => this.cargar()
    });
  }
}
