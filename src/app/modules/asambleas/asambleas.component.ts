import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-asambleas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="page-container">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="page-tag">GOBERNANZA Y PARTICIPACIÓN CIUDADANA</div>
          <h1 class="page-title">Asambleas y Votaciones Ponderadas</h1>
          <p class="page-subtitle">Deliberación democrática, quórum legal y votaciones calculadas por alícuota de copropiedad</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="cargarEncuestas()">
            <app-icon name="refresh" [size]="15"></app-icon>
            <span>Actualizar</span>
          </button>
          <button class="btn btn-primary" (click)="abrirModalNueva()">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>+ Convocar Votación</span>
          </button>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon active-icon">
            <app-icon name="vote" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Votaciones Abiertas</span>
            <span class="metric-val text-emerald">{{ totalAbiertas }}</span>
            <span class="metric-sub">En proceso de votación</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon votes-icon">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Votos Registrados</span>
            <span class="metric-val text-blue">{{ totalVotos }}</span>
            <span class="metric-sub">Total de votos emitidos</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon law-icon">
            <app-icon name="shield" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Ley Propiedad Horizontal</span>
            <span class="metric-val">100% Ponderado</span>
            <span class="metric-sub">Votos por alícuota %</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon closed-icon">
            <app-icon name="history" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Histórico Cerradas</span>
            <span class="metric-val">{{ totalCerradas }}</span>
            <span class="metric-sub">Asambleas concluidas</span>
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
            placeholder="Buscar por título de asamblea o tema..." 
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
            <option value="TODOS">Estado: Todas</option>
            <option value="ABIERTA">Abiertas (En votación)</option>
            <option value="CERRADA">Cerradas (Concluidas)</option>
          </select>
        </div>
      </div>

      <!-- LISTA DE ASAMBLEAS / VOTACIONES -->
      <div class="asambleas-grid">
        <div class="asamblea-card" *ngFor="let enc of encuestasFiltradas">
          <div class="card-header-row">
            <div class="badges-row">
              <span class="badge" [ngClass]="enc.estado === 'ABIERTA' ? 'badge-emerald' : 'badge-slate'">
                {{ enc.estado === 'ABIERTA' ? '🟢 VOTACIÓN EN CURSO' : '⚪ FINALIZADA' }}
              </span>
              <span class="badge badge-alicuota" *ngIf="enc.ponderar_por_alicuota">
                ⚖️ Ponderada por Alícuota
              </span>
              <span class="badge badge-slate" *ngIf="!enc.ponderar_por_alicuota">
                🗳️ Voto Simple (1 por unidad)
              </span>
            </div>

            <div class="card-actions">
              <button 
                *ngIf="enc.estado === 'ABIERTA'" 
                class="btn-close-poll" 
                (click)="confirmarCerrar(enc)" 
                title="Concluir votación">
                Cerrar Votación
              </button>
              <button 
                class="btn-action-delete" 
                (click)="confirmarEliminar(enc)" 
                title="Eliminar asamblea">
                <app-icon name="trash" [size]="14"></app-icon>
              </button>
            </div>
          </div>

          <div class="asamblea-body">
            <h2 class="asamblea-title">{{ enc.titulo }}</h2>
            <p class="asamblea-desc">{{ enc.descripcion }}</p>

            <div class="asamblea-dates">
              <span><strong>Inicio:</strong> {{ enc.fecha_inicio | date:'dd/MM/yyyy' }}</span>
              <span>•</span>
              <span><strong>Cierre:</strong> {{ enc.fecha_fin | date:'dd/MM/yyyy' }}</span>
              <span>•</span>
              <span><strong>Convocado por:</strong> {{ enc.creador_nombre || 'Mesa Directiva' }}</span>
            </div>

            <!-- OPCIONES Y RESULTADOS -->
            <div class="options-results-box">
              <div class="option-row" *ngFor="let op of enc.opciones">
                <div class="option-header">
                  <span class="option-text">{{ op.opcion_texto }}</span>
                  <div class="option-stats">
                    <span class="votes-count">{{ op.total_votos_opcion || 0 }} votos</span>
                    <span class="weight-count" *ngIf="enc.ponderar_por_alicuota">
                      ({{ (op.puntos_ponderados || 0) | number:'1.2-2' }}% alícuota)
                    </span>
                  </div>
                </div>

                <div class="progress-bar-bg">
                  <div 
                    class="progress-bar-fill" 
                    [style.width.%]="calcularPorcentaje(enc, op)">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="asamblea-footer">
            <span class="votes-total-label">
              Total votos emitidos: <strong>{{ enc.total_votos || 0 }}</strong>
            </span>
            <button 
              *ngIf="enc.estado === 'ABIERTA'" 
              class="btn btn-primary btn-sm" 
              (click)="abrirModalVotar(enc)">
              <app-icon name="vote" [size]="14"></app-icon>
              <span>Emitir Mi Voto</span>
            </button>
          </div>
        </div>

        <div *ngIf="encuestasFiltradas.length === 0" class="empty-state-card">
          <app-icon name="vote" [size]="40" customClass="empty-icon"></app-icon>
          <p class="empty-title">No hay asambleas o votaciones registradas</p>
          <p class="empty-desc">Convoca la primera votación de copropietarios para deliberar decisiones del condominio.</p>
        </div>
      </div>

      <!-- MODAL NUEVA ASAMBLEA / VOTACIÓN -->
      <div class="modal-backdrop" *ngIf="mostrarModalNueva">
        <div class="modal-box modal-lg">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Convocar Nueva Asamblea / Votación</h2>
              <p class="modal-subtitle">Configura el orden del día, fechas y opciones de votación</p>
            </div>
            <button class="modal-close-btn" (click)="mostrarModalNueva = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título de la Convocatoria / Asunto *</label>
              <input 
                type="text" 
                [(ngModel)]="nuevaEncuesta.titulo" 
                placeholder="Ej. Aprobación Cuota Extraordinaria para Reparación de Ascensores" 
                class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción y Justificación Técnica *</label>
              <textarea 
                [(ngModel)]="nuevaEncuesta.descripcion" 
                rows="3" 
                placeholder="Explica los antecedentes, presupuestos evaluados y el objetivo de la votación..." 
                class="form-control"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Fecha de Inicio *</label>
                <input 
                  type="date" 
                  [(ngModel)]="nuevaEncuesta.fecha_inicio" 
                  class="form-control" />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Fecha de Cierre *</label>
                <input 
                  type="date" 
                  [(ngModel)]="nuevaEncuesta.fecha_fin" 
                  class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-container">
                <input type="checkbox" [(ngModel)]="nuevaEncuesta.ponderar_por_alicuota" />
                <span><strong>Ponderar por Alícuota de Copropiedad</strong> (Recomendado según Ley de Propiedad Horizontal Boliviana)</span>
              </label>
            </div>

            <!-- Opciones Dinámicas -->
            <div class="form-group">
              <label class="form-label">Opciones de Votación (Mínimo 2) *</label>
              <div class="options-builder">
                <div class="option-input-row" *ngFor="let op of nuevaEncuesta.opciones; let i = index">
                  <input 
                    type="text" 
                    [(ngModel)]="nuevaEncuesta.opciones[i]" 
                    placeholder="Opción {{ i + 1 }}" 
                    class="form-control" />
                  <button 
                    *ngIf="nuevaEncuesta.opciones.length > 2" 
                    type="button" 
                    class="btn-remove-option" 
                    (click)="quitarOpcion(i)">
                    ✕
                  </button>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" (click)="agregarOpcion()">
                  + Agregar Opción Adicional
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="mostrarModalNueva = false">Cancelar</button>
            <button 
              class="btn btn-primary" 
              (click)="guardarEncuesta()" 
              [disabled]="!nuevaEncuesta.titulo || !nuevaEncuesta.fecha_inicio || !nuevaEncuesta.fecha_fin">
              <app-icon name="vote" [size]="15"></app-icon>
              <span>Convocar Votación</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL EMITIR VOTO -->
      <div class="modal-backdrop" *ngIf="encuestaAVotar">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Emitir Voto</h2>
              <p class="modal-subtitle">{{ encuestaAVotar.titulo }}</p>
            </div>
            <button class="modal-close-btn" (click)="encuestaAVotar = null">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Selecciona tu Unidad *</label>
              <select [(ngModel)]="votoData.unidad_id" class="form-control">
                <option [ngValue]="null" disabled selected>Seleccione la unidad que representa</option>
                <option *ngFor="let u of unidades" [value]="u.id">
                  Unidad {{ u.codigo }} (Alícuota: {{ u.alicuota || '0.00' }}%)
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Selecciona tu Opción de Voto *</label>
              <div class="vote-options-list">
                <label 
                  class="vote-option-card" 
                  *ngFor="let op of encuestaAVotar.opciones"
                  [class.selected]="votoData.opcion_id === op.id">
                  <input 
                    type="radio" 
                    name="opcionVoto" 
                    [value]="op.id" 
                    [(ngModel)]="votoData.opcion_id" />
                  <span class="vote-text">{{ op.opcion_texto }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="encuestaAVotar = null">Cancelar</button>
            <button 
              class="btn btn-primary" 
              (click)="ejecutarVoto()" 
              [disabled]="!votoData.unidad_id || !votoData.opcion_id">
              <app-icon name="check" [size]="15"></app-icon>
              <span>Confirmar Voto Vinculante</span>
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

    .active-icon { background: #ecfdf5; color: #059669; }
    .votes-icon { background: #e0f2fe; color: #0284c7; }
    .law-icon { background: #fef3c7; color: #b45309; }
    .closed-icon { background: #f1f5f9; color: #64748b; }

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
    .text-blue { color: #0284c7; }

    /* FILTERS */
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

    /* ASAMBLEAS CARDS */
    .asambleas-grid {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .asamblea-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .card-header-row {
      padding: 14px 20px;
      background: #fafafa;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .badges-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .badge-emerald {
      background: #dcfce7;
      color: #15803d;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .badge-slate {
      background: #f1f5f9;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .badge-alicuota {
      background: #fef3c7;
      color: #92400e;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-close-poll {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-close-poll:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .btn-action-delete {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid #fee2e2;
      background: #ffffff;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .btn-action-delete:hover {
      background: #fee2e2;
    }

    .asamblea-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .asamblea-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .asamblea-desc {
      font-size: 13.5px;
      color: #475569;
      margin: 0;
      line-height: 1.5;
    }

    .asamblea-dates {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #64748b;
    }

    /* OPCIONES */
    .options-results-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .option-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .option-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .option-text {
      font-size: 13.5px;
      font-weight: 700;
      color: #1e293b;
    }

    .option-stats {
      font-size: 12px;
      color: #475569;
    }

    .votes-count {
      font-weight: 700;
      color: #0f172a;
    }

    .weight-count {
      color: #059669;
      font-weight: 700;
      margin-left: 4px;
    }

    .progress-bar-bg {
      height: 10px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: #059669;
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .asamblea-footer {
      padding: 14px 20px;
      background: #fafafa;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .votes-total-label {
      font-size: 12.5px;
      color: #64748b;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* MODAL */
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
      max-width: 540px;
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
    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; max-height: 75vh; overflow-y: auto; }
    .modal-footer { padding: 14px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-row { display: flex; gap: 12px; }
    .flex-1 { flex: 1; }
    .form-label { font-size: 12.5px; font-weight: 700; color: #334155; }
    .form-control { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; }

    .options-builder {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-remove-option {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #334155;
      cursor: pointer;
    }

    .vote-options-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .vote-option-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .vote-option-card.selected {
      border-color: #059669;
      background: #ecfdf5;
    }

    .vote-text {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .empty-state-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 50px 20px;
      text-align: center;
    }

    .empty-icon { color: #cbd5e1; margin-bottom: 8px; }
    .empty-title { font-size: 15px; font-weight: 700; color: #334155; margin: 0 0 4px; }
    .empty-desc { font-size: 13px; color: #94a3b8; margin: 0; }
  `]
})
export class AsambleasComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  encuestas: any[] = [];
  unidades: any[] = [];

  filtroTexto: string = '';
  filtroEstado: string = 'TODOS';

  mostrarModalNueva = false;
  nuevaEncuesta: any = {
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ponderar_por_alicuota: true,
    opciones: ['A Favor / Aprobado', 'En Contra / Rechazado', 'Abstención']
  };

  encuestaAVotar: any = null;
  votoData: any = {
    unidad_id: null,
    opcion_id: null
  };

  ngOnInit() {
    this.cargarEncuestas();
    this.cargarUnidades();
  }

  cargarEncuestas() {
    this.api.getEncuestas().subscribe({
      next: (data) => this.encuestas = data || [],
      error: (err) => console.error(err)
    });
  }

  cargarUnidades() {
    this.api.getUnidades().subscribe({
      next: (d) => this.unidades = d.items || [],
      error: (err) => console.error(err)
    });
  }

  get totalAbiertas(): number {
    return this.encuestas.filter(e => e.estado === 'ABIERTA').length;
  }

  get totalCerradas(): number {
    return this.encuestas.filter(e => e.estado === 'CERRADA').length;
  }

  get totalVotos(): number {
    return this.encuestas.reduce((acc, e) => acc + parseInt(e.total_votos || 0, 10), 0);
  }

  get encuestasFiltradas(): any[] {
    return this.encuestas.filter(e => {
      if (this.filtroEstado !== 'TODOS' && e.estado !== this.filtroEstado) return false;
      if (this.filtroTexto.trim()) {
        const q = this.filtroTexto.toLowerCase();
        const coincideTit = e.titulo?.toLowerCase().includes(q);
        const coincideDesc = e.descripcion?.toLowerCase().includes(q);
        if (!coincideTit && !coincideDesc) return false;
      }
      return true;
    });
  }

  calcularPorcentaje(encuesta: any, opcion: any): number {
    if (!encuesta.opciones || encuesta.opciones.length === 0) return 0;
    if (encuesta.ponderar_por_alicuota) {
      const totalPuntos = encuesta.opciones.reduce((acc: number, op: any) => acc + parseFloat(op.puntos_ponderados || 0), 0);
      if (!totalPuntos) return 0;
      return Math.round((parseFloat(opcion.puntos_ponderados || 0) / totalPuntos) * 100);
    } else {
      const totalVotos = encuesta.opciones.reduce((acc: number, op: any) => acc + parseInt(op.total_votos_opcion || 0, 10), 0);
      if (!totalVotos) return 0;
      return Math.round((parseInt(opcion.total_votos_opcion || 0, 10) / totalVotos) * 100);
    }
  }

  abrirModalNueva() {
    const hoy = new Date().toISOString().split('T')[0];
    const enUnaSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.nuevaEncuesta = {
      titulo: '',
      descripcion: '',
      fecha_inicio: hoy,
      fecha_fin: enUnaSemana,
      ponderar_por_alicuota: true,
      opciones: ['A Favor / Aprobado', 'En Contra / Rechazado', 'Abstención']
    };
    this.mostrarModalNueva = true;
  }

  agregarOpcion() {
    this.nuevaEncuesta.opciones.push('');
  }

  quitarOpcion(index: number) {
    if (this.nuevaEncuesta.opciones.length > 2) {
      this.nuevaEncuesta.opciones.splice(index, 1);
    }
  }

  guardarEncuesta() {
    if (!this.nuevaEncuesta.titulo || !this.nuevaEncuesta.fecha_inicio || !this.nuevaEncuesta.fecha_fin) return;
    const opcionesLimpias = this.nuevaEncuesta.opciones.filter((op: string) => op.trim().length > 0);
    if (opcionesLimpias.length < 2) {
      alert('Debes ingresar al menos 2 opciones de votación');
      return;
    }

    this.api.crearEncuesta({
      ...this.nuevaEncuesta,
      opciones: opcionesLimpias
    }).subscribe({
      next: () => {
        this.mostrarModalNueva = false;
        this.cargarEncuestas();
      },
      error: (err) => alert(err.error?.message || 'Error convocando asamblea')
    });
  }

  abrirModalVotar(enc: any) {
    this.encuestaAVotar = enc;
    this.votoData = {
      unidad_id: null,
      opcion_id: null
    };
  }

  ejecutarVoto() {
    if (!this.votoData.unidad_id || !this.votoData.opcion_id || !this.encuestaAVotar) return;

    this.api.votarEncuesta({
      encuesta_id: this.encuestaAVotar.id,
      opcion_id: this.votoData.opcion_id,
      unidad_id: this.votoData.unidad_id
    }).subscribe({
      next: () => {
        this.encuestaAVotar = null;
        this.cargarEncuestas();
      },
      error: (err) => alert(err.error?.message || 'Error al emitir voto')
    });
  }

  async confirmarCerrar(enc: any) {
    const ok = await this.confirm.confirm({
      title: '¿Concluir votación de asamblea?',
      message: `Cerrarás la votación <strong>"${enc.titulo}"</strong>. No se admitirán nuevos votos de copropietarios y el resultado quedará registrado como definitivo.`,
      confirmText: 'Sí, concluir votación',
      cancelText: 'Mantener',
      type: 'info',
      icon: 'check-circle'
    });

    if (ok) {
      this.api.cerrarEncuesta(enc.id).subscribe({
        next: () => this.cargarEncuestas(),
        error: (err) => alert(err.error?.message || 'Error al cerrar votación')
      });
    }
  }

  async confirmarEliminar(enc: any) {
    const ok = await this.confirm.confirm({
      title: '¿Eliminar asamblea / votación?',
      message: `Eliminarás definitivamente la convocatoria <strong>"${enc.titulo}"</strong> y todos los votos asociados. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'trash'
    });

    if (ok) {
      this.api.eliminarEncuesta(enc.id).subscribe({
        next: () => this.cargarEncuestas(),
        error: (err) => alert(err.error?.message || 'Error al eliminar convocatoria')
      });
    }
  }
}
