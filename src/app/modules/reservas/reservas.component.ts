import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="reservas-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="tag-row">
            <span class="badge badge-rf">RF-07 Áreas Comunes</span>
            <span class="badge badge-slate">Convivencia y Espacios</span>
          </div>
          <h1 class="page-title">Áreas Comunes y Reservas</h1>
          <p class="page-subtitle">
            Parrillero, piscina, salón de eventos y canchas con control estricto de solapamiento y mora
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="abrirModalArea()">
            <app-icon name="plus" [size]="15"></app-icon>
            <span>Nueva Área</span>
          </button>
          <button class="btn btn-primary" (click)="abrirModalReserva()">
            <app-icon name="plus" [size]="15"></app-icon>
            <span>Nueva Reserva</span>
          </button>
        </div>
      </div>

      <!-- CATÁLOGO DE ÁREAS COMUNES -->
      <div class="areas-section">
        <div class="section-title-row">
          <h3 class="section-title">Espacios Comunes Disponibles</h3>
          <span class="badge badge-slate">{{ areas.length }} áreas activas</span>
        </div>

        <div class="areas-grid">
          <div class="area-card" *ngFor="let a of areas">
            <div class="area-top">
              <div class="area-icon-box">
                <app-icon [name]="getAreaIcon(a.nombre)" [size]="22" customClass="text-emerald"></app-icon>
              </div>
              <button 
                class="btn-icon-del" 
                (click)="eliminarArea(a)" 
                title="Dar de baja espacio">
                ✕
              </button>
            </div>

            <div class="area-info">
              <h4 class="area-name">{{ a.nombre }}</h4>
              <p class="area-desc">{{ a.descripcion || 'Espacio común de uso exclusivo para residentes del condominio.' }}</p>
            </div>

            <div class="area-details-row">
              <div class="detail-item">
                <span class="detail-label">Capacidad</span>
                <strong class="detail-val">{{ a.capacidad_maxima }} pers.</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Costo Turno</span>
                <strong class="detail-val text-emerald">Bs. {{ a.costo_reserva | number:'1.2-2' }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Horario</span>
                <strong class="detail-val">{{ a.hora_inicio }} - {{ a.hora_fin }}</strong>
              </div>
            </div>

            <button class="btn btn-outline btn-sm btn-quick-book" (click)="abrirModalReservaConArea(a)">
              Reservar Espacio
            </button>
          </div>
        </div>
      </div>

      <!-- TABLA DE RESERVAS REGISTRADAS -->
      <div class="table-card-section">
        <div class="card-header-bar">
          <div>
            <h3 class="section-title">Calendario de Reservas Registradas</h3>
            <p class="section-subtitle">Turnos activos, fechas programadas y cancelaciones</p>
          </div>

          <div class="filter-controls">
            <!-- Buscador Unificado -->
            <div class="search-box-container" style="max-width: 280px;">
              <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
              <input 
                type="search" 
                [(ngModel)]="searchQuery" 
                placeholder="Buscar por área o residente..." 
                class="clean-search-input" 
              />
              <button 
                *ngIf="searchQuery" 
                type="button" 
                class="clean-clear-btn" 
                (click)="searchQuery = ''"
                title="Borrar texto">
                ✕
              </button>
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
                [class.active]="filtroEstado === 'CONFIRMADA'" 
                (click)="filtroEstado = 'CONFIRMADA'">
                Confirmadas
              </button>
              <button 
                class="filter-pill" 
                [class.active]="filtroEstado === 'CANCELADA'" 
                (click)="filtroEstado = 'CANCELADA'">
                Canceladas
              </button>
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Área Común</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Unidad Solicitante</th>
                <th>Residente</th>
                <th>Importe</th>
                <th>Estado</th>
                <th style="text-align: right;">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reservasFiltradas">
                <td>
                  <strong class="font-bold">{{ r.area_nombre }}</strong>
                </td>
                <td>
                  <span class="date-badge">{{ r.fecha_reserva }}</span>
                </td>
                <td>
                  <span class="time-range">{{ r.hora_inicio }} - {{ r.hora_fin }}</span>
                </td>
                <td>
                  <span class="unit-code">{{ r.unidad_codigo }}</span>
                </td>
                <td>
                  <span>{{ r.solicitante_nombre }}</span>
                </td>
                <td>
                  <span class="cost-text">Bs. {{ (r.costo_total || 0) | number:'1.2-2' }}</span>
                </td>
                <td>
                  <span 
                    class="badge"
                    [class.badge-accent]="r.estado === 'CONFIRMADA'"
                    [class.badge-danger]="r.estado === 'CANCELADA'">
                    {{ r.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button 
                    *ngIf="r.estado === 'CONFIRMADA'" 
                    class="btn btn-outline btn-sm btn-cancel-reserva"
                    (click)="cancelarReserva(r)"
                    title="Cancelar turno">
                    Cancelar
                  </button>
                  <span *ngIf="r.estado === 'CANCELADA'" class="text-canceled">
                    Liberado
                  </span>
                </td>
              </tr>
              <tr *ngIf="reservasFiltradas.length === 0">
                <td colspan="8" class="empty-row">
                  No hay reservas registradas para los filtros seleccionados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL NUEVA RESERVA -->
      <div class="modal-backdrop" *ngIf="showModalReserva">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="badge badge-rf">Control Anti-Solapamiento</span>
              <h3 class="modal-title">Registrar Reserva de Espacio</h3>
            </div>
            <button class="btn-close" (click)="showModalReserva = false">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="errorReserva" class="alert-error">{{ errorReserva }}</div>

            <div class="form-group">
              <label class="form-label">Área Común *</label>
              <select [(ngModel)]="nuevaReserva.area_comun_id" class="ui-select form-control" (change)="onAreaSelected()">
                <option *ngFor="let a of areas" [value]="a.id">
                  {{ a.nombre }} — Tarifa: Bs. {{ a.costo_reserva | number:'1.2-2' }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Unidad Solicitante *</label>
              <select [(ngModel)]="nuevaReserva.unidad_id" class="ui-select form-control">
                <option *ngFor="let u of unidadesList" [value]="u.id">
                  {{ u.codigo }} ({{ u.estado }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Fecha de la Reserva *</label>
              <input type="date" [(ngModel)]="nuevaReserva.fecha_reserva" class="ui-input form-control" />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Hora Inicio *</label>
                <input type="time" [(ngModel)]="nuevaReserva.hora_inicio" class="ui-input form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Hora Fin *</label>
                <input type="time" [(ngModel)]="nuevaReserva.hora_fin" class="ui-input form-control" />
              </div>
            </div>

            <div class="cost-summary-box">
              <span>Importe total a liquidar:</span>
              <strong class="cost-total-amount">Bs. {{ nuevaReserva.costo_total | number:'1.2-2' }}</strong>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showModalReserva = false">Cancelar</button>
            <button class="btn btn-primary" (click)="guardarReserva()" [disabled]="saving">
              {{ saving ? 'Verificando...' : 'Confirmar Reserva' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL NUEVA ÁREA COMÚN -->
      <div class="modal-backdrop" *ngIf="showModalArea">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="badge badge-rf">Instalaciones</span>
              <h3 class="modal-title">Registrar Nueva Área Común</h3>
            </div>
            <button class="btn-close" (click)="showModalArea = false">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="errorArea" class="alert-error">{{ errorArea }}</div>

            <div class="form-group">
              <label class="form-label">Nombre del Espacio *</label>
              <input 
                type="text" 
                [(ngModel)]="nuevaArea.nombre" 
                placeholder="ej. Quincho / Parrilla Terraza Norte" 
                class="ui-input form-control" 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea 
                [(ngModel)]="nuevaArea.descripcion" 
                placeholder="Parrillero techado, mesas para 20 personas, lavaplatos..." 
                class="ui-input form-control" 
                rows="2">
              </textarea>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Capacidad Máxima (personas) *</label>
                <input type="number" [(ngModel)]="nuevaArea.capacidad_maxima" class="ui-input form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Costo por Turno (Bs.) *</label>
                <input type="number" step="0.5" [(ngModel)]="nuevaArea.costo_reserva" class="ui-input form-control" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Hora Apertura</label>
                <input type="time" [(ngModel)]="nuevaArea.hora_inicio" class="ui-input form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Hora Cierre</label>
                <input type="time" [(ngModel)]="nuevaArea.hora_fin" class="ui-input form-control" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showModalArea = false">Cancelar</button>
            <button class="btn btn-primary" (click)="guardarArea()" [disabled]="saving">
              {{ saving ? 'Guardando...' : 'Crear Espacio' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reservas-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .tag-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--ink);
    }

    .page-subtitle {
      font-size: 13.5px;
      color: var(--muted);
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    /* ÁREAS */
    .areas-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
    }

    .section-subtitle {
      font-size: 12.5px;
      color: var(--muted);
      margin-top: 2px;
    }

    .areas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .area-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--card-shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .area-card:hover {
      box-shadow: var(--soft-shadow);
      transform: translateY(-2px);
    }

    .area-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .area-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: #ecfdf5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon-del {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      border-radius: 6px;
    }

    .btn-icon-del:hover {
      background: #fee2e2;
      color: #ef4444;
    }

    .area-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .area-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--ink);
    }

    .area-desc {
      font-size: 12.5px;
      color: var(--muted);
      line-height: 1.4;
    }

    .area-details-row {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 10px;
      padding: 8px 12px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .detail-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
    }

    .detail-val {
      font-size: 12px;
      color: var(--ink);
    }

    .text-emerald {
      color: #059669;
    }

    .btn-quick-book {
      width: 100%;
      margin-top: 2px;
    }

    /* SECCIÓN TABLA */
    .table-card-section {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: var(--card-shadow);
    }

    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

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
      padding: 5px 12px;
      font-size: 12px;
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

    .date-badge {
      font-family: monospace;
      font-weight: 600;
      color: #334155;
      font-size: 12.5px;
    }

    .time-range {
      font-size: 12px;
      color: var(--muted);
    }

    .unit-code {
      font-weight: 700;
      color: var(--ink);
    }

    .cost-text {
      font-weight: 600;
      color: #059669;
    }

    .btn-cancel-reserva {
      color: #b91c1c;
      border-color: #fecaca;
    }

    .btn-cancel-reserva:hover {
      background: #fee2e2;
    }

    .text-canceled {
      font-size: 12px;
      color: var(--muted);
      font-style: italic;
    }

    .empty-row {
      text-align: center;
      padding: 32px;
      color: var(--muted);
      font-size: 13.5px;
    }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 16px;
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modalIn 0.15s ease-out;
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      padding: 18px 22px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .modal-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--ink);
      margin-top: 4px;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 16px;
      color: var(--muted);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .btn-close:hover {
      background: var(--surface-alt);
      color: var(--ink);
    }

    .modal-body {
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
    }

    .form-control {
      width: 100%;
    }

    .cost-summary-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #166534;
      font-size: 13px;
    }

    .cost-total-amount {
      font-size: 17px;
      font-weight: 800;
    }

    .modal-footer {
      padding: 14px 22px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      background: #fafafa;
    }

    .alert-error {
      background: var(--danger-light);
      border: 1px solid #fca5a5;
      color: var(--danger-text);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 500;
    }
  `]
})
export class ReservasComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  areas: any[] = [];
  reservas: any[] = [];
  unidadesList: any[] = [];

  searchQuery: string = '';
  filtroEstado: string = 'TODOS';
  saving: boolean = false;

  showModalReserva: boolean = false;
  showModalArea: boolean = false;

  errorReserva: string = '';
  errorArea: string = '';

  nuevaReserva = {
    area_comun_id: null,
    unidad_id: null,
    fecha_reserva: new Date().toISOString().substring(0, 10),
    hora_inicio: '12:00',
    hora_fin: '16:00',
    costo_total: 0
  };

  nuevaArea = {
    nombre: '',
    descripcion: '',
    capacidad_maxima: 20,
    costo_reserva: 150,
    hora_inicio: '08:00',
    hora_fin: '23:00'
  };

  get reservasFiltradas(): any[] {
    let list = this.reservas;
    if (this.filtroEstado !== 'TODOS') {
      list = list.filter(r => r.estado === this.filtroEstado);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r => 
        r.area_nombre?.toLowerCase().includes(q) ||
        r.solicitante_nombre?.toLowerCase().includes(q) ||
        r.unidad_codigo?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getAreasComunes().subscribe({
      next: (data) => this.areas = Array.isArray(data) ? data : (data?.items || []),
      error: (err) => console.error('Error al cargar áreas comunes:', err)
    });

    this.api.getReservas().subscribe({
      next: (data) => this.reservas = Array.isArray(data) ? data : (data?.items || []),
      error: (err) => console.error('Error al cargar reservas:', err)
    });

    this.api.getUnidades(1, 100).subscribe({
      next: (data) => this.unidadesList = Array.isArray(data) ? data : (data?.items || []),
      error: (err) => console.error('Error al cargar unidades:', err)
    });
  }

  abrirModalArea() {
    this.errorArea = '';
    this.nuevaArea = {
      nombre: '',
      descripcion: '',
      capacidad_maxima: 20,
      costo_reserva: 150,
      hora_inicio: '08:00',
      hora_fin: '23:00'
    };
    this.showModalArea = true;
  }

  abrirModalReserva() {
    this.errorReserva = '';
    this.nuevaReserva = {
      area_comun_id: this.areas.length > 0 ? this.areas[0].id : null,
      unidad_id: this.unidadesList.length > 0 ? this.unidadesList[0].id : null,
      fecha_reserva: new Date().toISOString().substring(0, 10),
      hora_inicio: '12:00',
      hora_fin: '16:00',
      costo_total: this.areas.length > 0 ? this.areas[0].costo_reserva : 0
    };
    this.showModalReserva = true;
  }

  abrirModalReservaConArea(area: any) {
    this.abrirModalReserva();
    this.nuevaReserva.area_comun_id = area.id;
    this.nuevaReserva.costo_total = area.costo_reserva;
  }

  onAreaSelected() {
    const area = this.areas.find(a => a.id === Number(this.nuevaReserva.area_comun_id));
    if (area) {
      this.nuevaReserva.costo_total = area.costo_reserva;
    }
  }

  guardarArea() {
    if (!this.nuevaArea.nombre) {
      this.errorArea = 'El nombre del área común es obligatorio.';
      return;
    }
    this.saving = true;
    this.errorArea = '';
    this.api.crearAreaComun(this.nuevaArea).subscribe({
      next: () => {
        this.saving = false;
        this.showModalArea = false;
        this.cargarDatos();
      },
      error: (err) => {
        this.saving = false;
        this.errorArea = err.error?.message || 'Error al registrar área común';
      }
    });
  }

  guardarReserva() {
    if (!this.nuevaReserva.area_comun_id || !this.nuevaReserva.unidad_id || !this.nuevaReserva.fecha_reserva) {
      this.errorReserva = 'Debes completar el área, la unidad y la fecha.';
      return;
    }

    this.saving = true;
    this.errorReserva = '';
    this.api.crearReserva(this.nuevaReserva).subscribe({
      next: () => {
        this.saving = false;
        this.showModalReserva = false;
        this.cargarDatos();
      },
      error: (err) => {
        this.saving = false;
        this.errorReserva = err.error?.message || 'Error al confirmar la reserva';
      }
    });
  }

  async cancelarReserva(reserva: any) {
    const confirmado = await this.confirm.confirm({
      title: '¿Cancelar reserva?',
      message: `Liberarás el turno de <strong>${reserva.area_nombre}</strong> para el ${reserva.fecha_reserva}. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, cancelar',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'calendar-x'
    });

    if (confirmado) {
      this.api.cancelarReserva(reserva.id, 'Cancelado por administración').subscribe({
        next: () => this.cargarDatos(),
        error: (err) => alert(err.error?.message || 'No se pudo cancelar la reserva.')
      });
    }
  }

  async eliminarArea(area: any) {
    const confirmado = await this.confirm.confirm({
      title: '¿Dar de baja esta área común?',
      message: `Desactivarás el área común <strong>${area.nombre}</strong>. No se podrán realizar nuevas reservas en ella.`,
      confirmText: 'Sí, dar de baja',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'trash'
    });

    if (confirmado) {
      this.api.eliminarAreaComun(area.id).subscribe({
        next: () => this.cargarDatos(),
        error: (err) => alert(err.error?.message || 'No se pudo eliminar el área.')
      });
    }
  }

  getAreaIcon(nombre: string): string {
    const n = (nombre || '').toLowerCase();
    if (n.includes('piscina')) return 'building';
    if (n.includes('parrilla') || n.includes('quincho')) return 'receipt';
    return 'building';
  }
}
