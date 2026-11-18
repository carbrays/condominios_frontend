import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="page-container">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="page-tag">OPERACIONES Y MANTENIMIENTO</div>
          <h1 class="page-title">Gestión de Incidencias y Averías</h1>
          <p class="page-subtitle">Control de tickets técnicos, reparaciones, seguimiento con residentes y contratistas</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="cargar()">
            <app-icon name="refresh" [size]="15"></app-icon>
            <span>Actualizar</span>
          </button>
          <button class="btn btn-primary" (click)="abrirModalReportar()">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>+ Reportar Incidencia</span>
          </button>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon total-icon">
            <app-icon name="wrench" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Total Registradas</span>
            <span class="metric-val">{{ incidencias.length }}</span>
            <span class="metric-sub">Histórico acumulado</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon pending-icon">
            <app-icon name="alert-triangle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Pendientes</span>
            <span class="metric-val text-amber">{{ totalPendientes }}</span>
            <span class="metric-sub">Requieren inspección</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon process-icon">
            <app-icon name="refresh" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">En Proceso</span>
            <span class="metric-val text-blue">{{ totalEnProceso }}</span>
            <span class="metric-sub">Técnico asignado</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon resolved-icon">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Resueltas</span>
            <span class="metric-val text-emerald">{{ totalResueltas }}</span>
            <span class="metric-sub">Solución verificada</span>
          </div>
        </div>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <div class="filters-card">
        <!-- BUSCADOR CON CLEAR RÁPIDO SIN DESFASE -->
        <div class="search-box-container">
          <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="filtroTexto" 
            placeholder="Buscar por título, ubicación, categoría o reportante..." 
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
          <!-- Filtro Estado -->
          <select [(ngModel)]="filtroEstado" class="filter-select">
            <option value="TODOS">Estado: Todos</option>
            <option value="PENDIENTE">Estado: Pendiente</option>
            <option value="EN_PROCESO">Estado: En Proceso</option>
            <option value="RESUELTO">Estado: Resuelto</option>
            <option value="CANCELADO">Estado: Cancelado</option>
          </select>

          <!-- Filtro Prioridad -->
          <select [(ngModel)]="filtroPrioridad" class="filter-select">
            <option value="TODAS">Prioridad: Todas</option>
            <option value="URGENTE">Prioridad: Urgente</option>
            <option value="ALTA">Prioridad: Alta</option>
            <option value="MEDIA">Prioridad: Media</option>
            <option value="BAJA">Prioridad: Baja</option>
          </select>

          <!-- Filtro Categoría -->
          <select [(ngModel)]="filtroCategoria" class="filter-select">
            <option value="TODAS">Categoría: Todas</option>
            <option value="Plomería / Agua">Plomería / Agua</option>
            <option value="Electricidad">Electricidad</option>
            <option value="Ascensores">Ascensores</option>
            <option value="Seguridad / Accesos">Seguridad / Accesos</option>
            <option value="Áreas Comunes">Áreas Comunes</option>
            <option value="Limpieza">Limpieza</option>
            <option value="Jardinería">Jardinería</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <!-- TABLA DE INCIDENCIAS -->
      <div class="ui-card">
        <div class="table-container">
          <table class="ui-table">
            <thead>
              <tr>
                <th style="width: 80px;">TICKET</th>
                <th>ASUNTO Y DESCRIPCIÓN</th>
                <th style="width: 140px;">CATEGORÍA</th>
                <th style="width: 110px;">PRIORIDAD</th>
                <th>UBICACIÓN / UNIDAD</th>
                <th>REPORTADO POR</th>
                <th style="width: 120px;">ESTADO</th>
                <th style="width: 130px; text-align: right;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inc of incidenciasFiltradas">
                <td>
                  <span class="ticket-id">#{{ inc.id }}</span>
                </td>
                <td>
                  <div class="incident-title-box">
                    <span class="incident-title">{{ inc.titulo }}</span>
                    <span class="incident-desc">{{ inc.descripcion }}</span>
                  </div>
                </td>
                <td>
                  <span class="category-badge">{{ inc.categoria }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getPrioridadBadgeClass(inc.prioridad)">
                    {{ inc.prioridad }}
                  </span>
                </td>
                <td>
                  <div class="location-box">
                    <span class="location-text">{{ inc.unidad_codigo ? 'Unidad ' + inc.unidad_codigo : (inc.ubicacion || 'Área Común') }}</span>
                  </div>
                </td>
                <td>
                  <div class="reporter-box">
                    <span class="reporter-name">{{ inc.reportado_por_nombre || 'Residente' }}</span>
                    <span class="reporter-date">{{ inc.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getEstadoBadgeClass(inc.estado)">
                    {{ inc.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="actions-group">
                    <button class="btn-action-view" (click)="abrirDetalle(inc)" title="Ver seguimiento y comentarios">
                      <app-icon name="message-square" [size]="14"></app-icon>
                    </button>
                    <button class="btn-action-delete" (click)="confirmarEliminar(inc)" title="Eliminar ticket">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="incidenciasFiltradas.length === 0">
                <td colspan="8" class="empty-state">
                  <app-icon name="wrench" [size]="36" customClass="empty-icon"></app-icon>
                  <p class="empty-title">No se encontraron incidencias</p>
                  <p class="empty-desc">No hay tickets que coincidan con los criterios de búsqueda seleccionados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL REPORTAR NUEVA INCIDENCIA -->
      <div class="modal-backdrop" *ngIf="mostrarModalReportar">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Reportar Nueva Incidencia</h2>
              <p class="modal-subtitle">Registra averías técnicas o reclamos para su atención inmediata</p>
            </div>
            <button class="modal-close-btn" (click)="cerrarModalReportar()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título de la Incidencia *</label>
              <input 
                type="text" 
                [(ngModel)]="nuevaIncidencia.titulo" 
                placeholder="Ej. Fuga de agua en pasillo piso 4, Luz parpadeante en ascensor B" 
                class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Categoría *</label>
                <select [(ngModel)]="nuevaIncidencia.categoria" class="form-control">
                  <option value="Plomería / Agua">Plomería / Agua</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Ascensores">Ascensores</option>
                  <option value="Seguridad / Accesos">Seguridad / Accesos</option>
                  <option value="Áreas Comunes">Áreas Comunes</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Jardinería">Jardinería</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Prioridad *</label>
                <select [(ngModel)]="nuevaIncidencia.prioridad" class="form-control">
                  <option value="BAJA">Baja (Rutinaria)</option>
                  <option value="MEDIA">Media (Estándar)</option>
                  <option value="ALTA">Alta (Urgente atención)</option>
                  <option value="URGENTE">Urgente (Crítico / Emergencia)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Unidad Afectada (Opcional)</label>
                <select [(ngModel)]="nuevaIncidencia.unidad_id" class="form-control">
                  <option [ngValue]="null">Ninguna (Área Común)</option>
                  <option *ngFor="let u of unidades" [value]="u.id">Unidad {{ u.codigo }} ({{ u.tipo }})</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Ubicación / Sector Específico</label>
                <input 
                  type="text" 
                  [(ngModel)]="nuevaIncidencia.ubicacion" 
                  placeholder="Ej. Torre A - Piso 3, Parrillero Norte" 
                  class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción Detallada *</label>
              <textarea 
                [(ngModel)]="nuevaIncidencia.descripcion" 
                rows="4" 
                placeholder="Describe el problema observado, causas potenciales o instrucciones para el personal técnico..." 
                class="form-control"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalReportar()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardarIncidencia()" [disabled]="!nuevaIncidencia.titulo || !nuevaIncidencia.descripcion">
              <app-icon name="wrench" [size]="15"></app-icon>
              <span>Crear Ticket</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL DETALLE Y SEGUIMIENTO -->
      <div class="modal-backdrop" *ngIf="incidenciaSeleccionada">
        <div class="modal-box modal-lg">
          <div class="modal-header">
            <div>
              <div class="d-flex align-center gap-8">
                <span class="ticket-id">#{{ incidenciaSeleccionada.id }}</span>
                <span class="badge" [ngClass]="getEstadoBadgeClass(incidenciaSeleccionada.estado)">
                  {{ incidenciaSeleccionada.estado }}
                </span>
                <span class="badge" [ngClass]="getPrioridadBadgeClass(incidenciaSeleccionada.prioridad)">
                  {{ incidenciaSeleccionada.prioridad }}
                </span>
              </div>
              <h2 class="modal-title" style="margin-top: 6px;">{{ incidenciaSeleccionada.titulo }}</h2>
            </div>
            <button class="modal-close-btn" (click)="incidenciaSeleccionada = null">✕</button>
          </div>

          <div class="modal-body">
            <!-- Detalles generales -->
            <div class="ticket-info-grid">
              <div class="info-cell">
                <span class="cell-label">Categoría</span>
                <span class="cell-val">{{ incidenciaSeleccionada.categoria }}</span>
              </div>
              <div class="info-cell">
                <span class="cell-label">Ubicación</span>
                <span class="cell-val">{{ incidenciaSeleccionada.unidad_codigo ? 'Unidad ' + incidenciaSeleccionada.unidad_codigo : (incidenciaSeleccionada.ubicacion || 'Área Común') }}</span>
              </div>
              <div class="info-cell">
                <span class="cell-label">Reportado Por</span>
                <span class="cell-val">{{ incidenciaSeleccionada.reportado_por_nombre || 'Residente' }}</span>
              </div>
              <div class="info-cell">
                <span class="cell-label">Fecha Reporte</span>
                <span class="cell-val">{{ incidenciaSeleccionada.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="description-box">
              <span class="desc-heading">Descripción del Problema:</span>
              <p class="desc-content">{{ incidenciaSeleccionada.descripcion }}</p>
            </div>

            <!-- Cambio de Estado Rápido -->
            <div class="status-change-bar">
              <span class="status-label">Cambiar Estado Operativo:</span>
              <div class="status-buttons">
                <button 
                  class="btn-status" 
                  [class.active]="incidenciaSeleccionada.estado === 'PENDIENTE'"
                  (click)="cambiarEstado('PENDIENTE')">
                  Pendiente
                </button>
                <button 
                  class="btn-status btn-status-proc" 
                  [class.active]="incidenciaSeleccionada.estado === 'EN_PROCESO'"
                  (click)="cambiarEstado('EN_PROCESO')">
                  En Proceso
                </button>
                <button 
                  class="btn-status btn-status-res" 
                  [class.active]="incidenciaSeleccionada.estado === 'RESUELTO'"
                  (click)="cambiarEstado('RESUELTO')">
                  Resuelto
                </button>
                <button 
                  class="btn-status btn-status-cancel" 
                  [class.active]="incidenciaSeleccionada.estado === 'CANCELADO'"
                  (click)="cambiarEstado('CANCELADO')">
                  Cancelado
                </button>
              </div>
            </div>

            <!-- Bitácora y Comentarios -->
            <div class="comments-section">
              <h3 class="section-title">Bitácora de Seguimiento</h3>
              
              <div class="comments-list">
                <div class="comment-item" *ngFor="let c of comentarios">
                  <div class="comment-header">
                    <span class="comment-author">{{ c.usuario_nombre || 'Administración' }}</span>
                    <span class="comment-time">{{ c.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <p class="comment-text">{{ c.comentario }}</p>
                </div>

                <div class="empty-comments" *ngIf="comentarios.length === 0">
                  <p>No hay notas técnicas registradas aún en este ticket.</p>
                </div>
              </div>

              <!-- Input nuevo comentario -->
              <div class="new-comment-box">
                <input 
                  type="text" 
                  [(ngModel)]="nuevoComentario" 
                  placeholder="Escribe una actualización técnica o nota de seguimiento..." 
                  class="comment-input"
                  (keyup.enter)="agregarComentario()" />
                <button class="btn btn-secondary" (click)="agregarComentario()" [disabled]="!nuevoComentario.trim()">
                  <app-icon name="send" [size]="14"></app-icon>
                  <span>Añadir Nota</span>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="incidenciaSeleccionada = null">Cerrar</button>
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
    .pending-icon { background: #fef3c7; color: #b45309; }
    .process-icon { background: #e0f2fe; color: #0284c7; }
    .resolved-icon { background: #ecfdf5; color: #059669; }

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
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    .metric-sub {
      font-size: 11px;
      color: #94a3b8;
    }

    .text-amber { color: #b45309; }
    .text-blue { color: #0284c7; }
    .text-emerald { color: #059669; }

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
      flex-wrap: wrap;
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

    .filter-select:focus {
      border-color: #059669;
      background: #ffffff;
    }

    /* TABLE */
    .ticket-id {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      background: #f1f5f9;
      padding: 3px 6px;
      border-radius: 6px;
    }

    .incident-title-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .incident-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .incident-desc {
      font-size: 12px;
      color: #64748b;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .category-badge {
      display: inline-block;
      font-size: 11.5px;
      font-weight: 600;
      color: #334155;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .badge-urgent {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }

    .badge-high {
      background: #ffedd5;
      color: #c2410c;
    }

    .badge-medium {
      background: #e0f2fe;
      color: #0369a1;
    }

    .badge-low {
      background: #f1f5f9;
      color: #64748b;
    }

    .badge-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-process {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-resolved {
      background: #dcfce7;
      color: #15803d;
    }

    .badge-cancelled {
      background: #f1f5f9;
      color: #64748b;
    }

    .location-box {
      font-size: 12.5px;
      font-weight: 600;
      color: #1e293b;
    }

    .reporter-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .reporter-name {
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
    }

    .reporter-date {
      font-size: 11px;
      color: #94a3b8;
    }

    .actions-group {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }

    .btn-action-view {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-action-view:hover {
      background: #e0f2fe;
      border-color: #bae6fd;
    }

    .btn-action-delete {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      border: 1px solid #fee2e2;
      background: #ffffff;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-action-delete:hover {
      background: #fee2e2;
    }

    /* MODALES */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 580px;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }

    .modal-lg {
      max-width: 720px;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0;
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      font-size: 18px;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }

    .modal-close-btn:hover {
      color: #0f172a;
    }

    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 75vh;
      overflow-y: auto;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      background: #f8fafc;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .flex-1 { flex: 1; }

    .form-label {
      font-size: 12.5px;
      font-weight: 700;
      color: #334155;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-control:focus {
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    /* DETALLE INCIDENCIA */
    .ticket-info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .info-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cell-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    .cell-val {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .description-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
    }

    .desc-heading {
      font-size: 11.5px;
      font-weight: 700;
      color: #475569;
      display: block;
      margin-bottom: 4px;
    }

    .desc-content {
      font-size: 13px;
      color: #1e293b;
      margin: 0;
      line-height: 1.5;
    }

    .status-change-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .status-label {
      font-size: 12.5px;
      font-weight: 700;
      color: #334155;
    }

    .status-buttons {
      display: flex;
      gap: 6px;
    }

    .btn-status {
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }

    .btn-status.active {
      background: #fef3c7;
      color: #92400e;
      border-color: #f59e0b;
    }

    .btn-status-proc.active {
      background: #dbeafe;
      color: #1e40af;
      border-color: #3b82f6;
    }

    .btn-status-res.active {
      background: #dcfce7;
      color: #15803d;
      border-color: #10b981;
    }

    .btn-status-cancel.active {
      background: #f1f5f9;
      color: #64748b;
      border-color: #94a3b8;
    }

    /* BITACORA */
    .comments-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .comments-list {
      max-height: 180px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      background: #fafafa;
    }

    .comment-item {
      background: #ffffff;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #f1f5f9;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    .comment-author {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .comment-time {
      font-size: 10.5px;
      color: #94a3b8;
    }

    .comment-text {
      font-size: 12px;
      color: #334155;
      margin: 0;
    }

    .empty-comments {
      padding: 12px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    .new-comment-box {
      display: flex;
      gap: 8px;
    }

    .comment-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 12.5px;
      outline: none;
    }

    .comment-input:focus {
      border-color: #059669;
    }

    /* EMPTY STATE */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon {
      color: #cbd5e1;
      margin-bottom: 8px;
    }

    .empty-title {
      font-size: 15px;
      font-weight: 700;
      color: #334155;
      margin: 0 0 4px;
    }

    .empty-desc {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }

    .d-flex { display: flex; }
    .align-center { align-items: center; }
    .gap-8 { gap: 8px; }
  `]
})
export class IncidenciasComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  incidencias: any[] = [];
  unidades: any[] = [];

  // Filtros
  filtroTexto: string = '';
  filtroEstado: string = 'TODOS';
  filtroPrioridad: string = 'TODAS';
  filtroCategoria: string = 'TODAS';

  // Modal Reportar
  mostrarModalReportar = false;
  nuevaIncidencia: any = {
    titulo: '',
    descripcion: '',
    categoria: 'Plomería / Agua',
    prioridad: 'MEDIA',
    ubicacion: '',
    unidad_id: null
  };

  // Modal Detalle & Seguimiento
  incidenciaSeleccionada: any = null;
  comentarios: any[] = [];
  nuevoComentario: string = '';

  ngOnInit() {
    this.cargar();
    this.cargarUnidades();
  }

  cargar() {
    this.api.getIncidencias().subscribe({
      next: (d) => {
        this.incidencias = d.items || [];
      },
      error: (err) => console.error('Error cargando incidencias', err)
    });
  }

  cargarUnidades() {
    this.api.getUnidades().subscribe({
      next: (d) => {
        this.unidades = d.items || [];
      },
      error: (err) => console.error('Error cargando unidades', err)
    });
  }

  get totalPendientes(): number {
    return this.incidencias.filter(i => i.estado === 'PENDIENTE').length;
  }

  get totalEnProceso(): number {
    return this.incidencias.filter(i => i.estado === 'EN_PROCESO').length;
  }

  get totalResueltas(): number {
    return this.incidencias.filter(i => i.estado === 'RESUELTO').length;
  }

  get incidenciasFiltradas(): any[] {
    return this.incidencias.filter(inc => {
      // Filtro texto
      if (this.filtroTexto.trim()) {
        const query = this.filtroTexto.toLowerCase();
        const coincideTitulo = inc.titulo?.toLowerCase().includes(query);
        const coincideDesc = inc.descripcion?.toLowerCase().includes(query);
        const coincideUbicacion = inc.ubicacion?.toLowerCase().includes(query) || inc.unidad_codigo?.toLowerCase().includes(query);
        const coincideCategoria = inc.categoria?.toLowerCase().includes(query);
        const coincideReportante = inc.reportado_por_nombre?.toLowerCase().includes(query);
        if (!coincideTitulo && !coincideDesc && !coincideUbicacion && !coincideCategoria && !coincideReportante) {
          return false;
        }
      }

      // Filtro estado
      if (this.filtroEstado !== 'TODOS' && inc.estado !== this.filtroEstado) {
        return false;
      }

      // Filtro prioridad
      if (this.filtroPrioridad !== 'TODAS' && inc.prioridad !== this.filtroPrioridad) {
        return false;
      }

      // Filtro categoría
      if (this.filtroCategoria !== 'TODAS' && inc.categoria !== this.filtroCategoria) {
        return false;
      }

      return true;
    });
  }

  getPrioridadBadgeClass(p: string): string {
    switch (p) {
      case 'URGENTE': return 'badge-urgent';
      case 'ALTA': return 'badge-high';
      case 'MEDIA': return 'badge-medium';
      case 'BAJA': return 'badge-low';
      default: return 'badge-low';
    }
  }

  getEstadoBadgeClass(e: string): string {
    switch (e) {
      case 'PENDIENTE': return 'badge-pending';
      case 'EN_PROCESO': return 'badge-process';
      case 'RESUELTO': return 'badge-resolved';
      case 'CANCELADO': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  }

  abrirModalReportar() {
    this.nuevaIncidencia = {
      titulo: '',
      descripcion: '',
      categoria: 'Plomería / Agua',
      prioridad: 'MEDIA',
      ubicacion: '',
      unidad_id: null
    };
    this.mostrarModalReportar = true;
  }

  cerrarModalReportar() {
    this.mostrarModalReportar = false;
  }

  guardarIncidencia() {
    if (!this.nuevaIncidencia.titulo || !this.nuevaIncidencia.descripcion) return;

    this.api.crearIncidencia(this.nuevaIncidencia).subscribe({
      next: () => {
        this.cerrarModalReportar();
        this.cargar();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al reportar la incidencia');
      }
    });
  }

  abrirDetalle(inc: any) {
    this.incidenciaSeleccionada = { ...inc };
    this.comentarios = [];
    this.nuevoComentario = '';
    this.api.getIncidenciaDetalle(inc.id).subscribe({
      next: (d) => {
        this.incidenciaSeleccionada = d;
        this.comentarios = d.comentarios || [];
      },
      error: () => {
        // Fallback
        this.comentarios = [];
      }
    });
  }

  cambiarEstado(nuevoEstado: string) {
    if (!this.incidenciaSeleccionada) return;
    this.api.actualizarEstadoIncidencia(this.incidenciaSeleccionada.id, nuevoEstado).subscribe({
      next: () => {
        this.incidenciaSeleccionada.estado = nuevoEstado;
        this.cargar();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al cambiar estado de la incidencia');
      }
    });
  }

  agregarComentario() {
    if (!this.incidenciaSeleccionada || !this.nuevoComentario.trim()) return;

    this.api.agregarComentarioIncidencia(this.incidenciaSeleccionada.id, this.nuevoComentario.trim()).subscribe({
      next: (c) => {
        this.comentarios.push(c);
        this.nuevoComentario = '';
      },
      error: (err) => {
        alert(err.error?.message || 'Error al agregar nota técnica');
      }
    });
  }

  async confirmarEliminar(inc: any) {
    const ok = await this.confirm.confirm({
      title: '¿Eliminar incidencia?',
      message: `Eliminarás definitivamente el ticket <strong>#${inc.id} - ${inc.titulo}</strong>. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'trash'
    });

    if (ok) {
      this.api.eliminarIncidencia(inc.id).subscribe({
        next: () => {
          this.cargar();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al eliminar la incidencia');
        }
      });
    }
  }
}
