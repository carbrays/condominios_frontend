import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-conserjeria',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="page-container">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="page-tag">SEGURIDAD Y CONTROL DE ACCESOS</div>
          <h1 class="page-title">Conserjería, Ingresos y Paquetería</h1>
          <p class="page-subtitle">Gestión en tiempo real de visitas, recepción de encomiendas y validación de pases QR</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="cargarDatos()">
            <app-icon name="refresh" [size]="15"></app-icon>
            <span>Actualizar</span>
          </button>
          <button class="btn btn-secondary" (click)="abrirModalPaquete()">
            <app-icon name="package" [size]="15"></app-icon>
            <span>+ Recibir Paquete</span>
          </button>
          <button class="btn btn-primary" (click)="abrirModalVisita()">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>+ Registrar Visita</span>
          </button>
        </div>
      </div>

      <!-- KPI METRICS -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon visits-icon">
            <app-icon name="users" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Visitas en Edificio</span>
            <span class="metric-val text-amber">{{ totalVisitasActivas }}</span>
            <span class="metric-sub">Actualmente adentro</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon package-icon">
            <app-icon name="package" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Paquetes en Custodia</span>
            <span class="metric-val text-blue">{{ totalPaquetesEnCustodia }}</span>
            <span class="metric-sub">Pendientes de retiro</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon delivered-icon">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Entregas Realizadas</span>
            <span class="metric-val text-emerald">{{ totalPaquetesEntregados }}</span>
            <span class="metric-sub">Histórico entregado</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon qr-icon">
            <app-icon name="qr" [size]="20"></app-icon>
          </div>
          <div class="metric-content">
            <span class="metric-label">Control Acceso QR</span>
            <span class="metric-val">Activo</span>
            <span class="metric-sub">Sincronización online</span>
          </div>
        </div>
      </div>

      <!-- VALIDADOR RÁPIDO QR -->
      <div class="qr-validator-card">
        <div class="validator-header">
          <div class="validator-title-row">
            <app-icon name="qr" [size]="18" customClass="qr-icon-title"></app-icon>
            <span class="validator-title">Validador Instantáneo de Pases QR</span>
          </div>
          <span class="validator-hint">Escanea o ingresa el código criptográfico seguro del visitante</span>
        </div>

        <div class="validator-input-row">
          <div class="search-box-container" style="flex: 1;">
            <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="codigoQR" 
              placeholder="Ej. e7b5fa48c291410d8a956897..." 
              (keyup.enter)="validarQR()"
              class="clean-search-input" />
            <button 
              type="button" 
              *ngIf="codigoQR" 
              (click)="codigoQR = ''; qrResultado = null" 
              class="clean-clear-btn" 
              title="Borrar código">
              ✕
            </button>
          </div>
          <button class="btn btn-primary" (click)="validarQR()" [disabled]="!codigoQR.trim()">
            <app-icon name="check" [size]="15"></app-icon>
            <span>Verificar Autorización</span>
          </button>
        </div>

        <!-- Banner resultado de validación QR -->
        <div *ngIf="qrResultado" class="qr-result-box" [ngClass]="qrResultado.valido ? 'qr-success' : 'qr-error'">
          <div class="qr-result-header">
            <span class="qr-status-pill">{{ qrResultado.valido ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO' }}</span>
            <span class="qr-result-msg">{{ qrResultado.mensaje }}</span>
          </div>
          <div *ngIf="qrResultado.pase" class="qr-details-grid">
            <div class="qr-item">
              <span class="qr-label">Visitante:</span>
              <span class="qr-val">{{ qrResultado.pase.nombre_visitante }}</span>
            </div>
            <div class="qr-item">
              <span class="qr-label">Documento:</span>
              <span class="qr-val">{{ qrResultado.pase.documento_visitante || 'No registrado' }}</span>
            </div>
            <div class="qr-item">
              <span class="qr-label">Unidad Destino:</span>
              <span class="qr-val font-bold">Unidad {{ qrResultado.pase.unidad_codigo }}</span>
            </div>
            <div class="qr-item">
              <span class="qr-label">Vigencia:</span>
              <span class="qr-val">{{ qrResultado.pase.fecha_expiracion | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TABS DE CONSERJERÍA -->
      <div class="tabs-bar">
        <button 
          class="tab-btn" 
          [class.active]="tabActiva === 'visitas'" 
          (click)="tabActiva = 'visitas'">
          <app-icon name="users" [size]="16"></app-icon>
          <span>Control de Visitas ({{ visitas.length }})</span>
        </button>
        <button 
          class="tab-btn" 
          [class.active]="tabActiva === 'paquetes'" 
          (click)="tabActiva = 'paquetes'">
          <app-icon name="package" [size]="16"></app-icon>
          <span>Paquetería y Encomiendas ({{ paquetes.length }})</span>
        </button>
      </div>

      <!-- VISTA: CONTROL DE VISITAS -->
      <div class="ui-card" *ngIf="tabActiva === 'visitas'">
        <!-- Filtros visitas -->
        <div class="tab-filters">
          <div class="search-box-container" style="max-width: 380px;">
            <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="filtroTextoVisitas" 
              placeholder="Buscar visitante por nombre, CI o unidad..." 
              class="clean-search-input" />
            <button 
              type="button" 
              *ngIf="filtroTextoVisitas" 
              (click)="filtroTextoVisitas = ''" 
              class="clean-clear-btn" 
              title="Borrar búsqueda">
              ✕
            </button>
          </div>

          <div class="filter-actions">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="soloVisitasActivas" (change)="cargarVisitas()" />
              <span>Mostrar solo visitas activas en el edificio</span>
            </label>
          </div>
        </div>

        <div class="table-container">
          <table class="ui-table">
            <thead>
              <tr>
                <th>VISITANTE</th>
                <th>DOC / CI</th>
                <th>UNIDAD DESTINO</th>
                <th>VEHÍCULO / PLACA</th>
                <th>HORA INGRESO</th>
                <th>HORA SALIDA</th>
                <th>ESTADO</th>
                <th style="text-align: right;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of visitasFiltradas">
                <td>
                  <div class="visitor-box">
                    <span class="visitor-name">{{ v.visitante_nombre }}</span>
                    <span class="visitor-obs" *ngIf="v.observaciones">{{ v.observaciones }}</span>
                  </div>
                </td>
                <td>
                  <span class="ci-badge">{{ v.visitante_documento || 'Sin doc' }}</span>
                </td>
                <td>
                  <span class="unit-badge">Unidad {{ v.unidad_codigo }}</span>
                </td>
                <td>
                  <span class="plate-text" *ngIf="v.vehiculo_placa">🚗 {{ v.vehiculo_placa }}</span>
                  <span class="text-muted" *ngIf="!v.vehiculo_placa">Peatonal</span>
                </td>
                <td>
                  <span class="time-text">{{ v.fecha_entrada | date:'dd/MM HH:mm' }}</span>
                </td>
                <td>
                  <span class="time-text text-emerald" *ngIf="v.fecha_salida">{{ v.fecha_salida | date:'dd/MM HH:mm' }}</span>
                  <span class="text-amber font-bold" *ngIf="!v.fecha_salida">En predio</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="v.fecha_salida ? 'badge-neutral' : 'badge-amber'">
                    {{ v.fecha_salida ? 'SALIDA REGISTRADA' : 'PRESENTE' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="actions-group">
                    <button 
                      *ngIf="!v.fecha_salida" 
                      class="btn-action-checkout" 
                      (click)="registrarSalida(v)" 
                      title="Registrar Salida">
                      Marcar Salida
                    </button>
                    <button 
                      class="btn-action-delete" 
                      (click)="confirmarEliminarVisita(v)" 
                      title="Eliminar registro">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="visitasFiltradas.length === 0">
                <td colspan="8" class="empty-state">
                  <app-icon name="users" [size]="36" customClass="empty-icon"></app-icon>
                  <p class="empty-title">No hay registros de visitas</p>
                  <p class="empty-desc">No se encontraron visitas que coincidan con los filtros aplicados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VISTA: PAQUETERÍA Y ENCOMIENDAS -->
      <div class="ui-card" *ngIf="tabActiva === 'paquetes'">
        <div class="tab-filters">
          <div class="search-box-container" style="max-width: 380px;">
            <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="filtroTextoPaquetes" 
              placeholder="Buscar por destinatario, código o empresa..." 
              class="clean-search-input" />
            <button 
              type="button" 
              *ngIf="filtroTextoPaquetes" 
              (click)="filtroTextoPaquetes = ''" 
              class="clean-clear-btn" 
              title="Borrar búsqueda">
              ✕
            </button>
          </div>

          <div class="filter-actions">
            <select [(ngModel)]="filtroEstadoPaquetes" class="filter-select">
              <option value="TODOS">Estado: Todos</option>
              <option value="RECIBIDO">En Custodia (Recibido)</option>
              <option value="ENTREGADO">Entregados</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="ui-table">
            <thead>
              <tr>
                <th>DESTINATARIO</th>
                <th>UNIDAD</th>
                <th>EMPRESA / TRANSPORTE</th>
                <th>CÓDIGO / GUÍA</th>
                <th>RECEPCIÓN</th>
                <th>ENTREGA</th>
                <th>ESTADO</th>
                <th style="text-align: right;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of paquetesFiltrados">
                <td>
                  <span class="visitor-name">{{ p.destinatario_nombre }}</span>
                </td>
                <td>
                  <span class="unit-badge">Unidad {{ p.unidad_codigo }}</span>
                </td>
                <td>
                  <span class="carrier-badge">📦 {{ p.empresa_transporte || 'Particular' }}</span>
                </td>
                <td>
                  <span class="code-mono">{{ p.codigo_paquete || 'Sin código' }}</span>
                </td>
                <td>
                  <span class="time-text">{{ p.fecha_recepcion | date:'dd/MM/yyyy HH:mm' }}</span>
                </td>
                <td>
                  <div class="delivery-box" *ngIf="p.fecha_entrega">
                    <span class="time-text text-emerald">{{ p.fecha_entrega | date:'dd/MM/yyyy HH:mm' }}</span>
                    <small class="receiver-sub">A: {{ p.entregado_a || 'Residente' }}</small>
                  </div>
                  <span class="text-amber font-bold" *ngIf="!p.fecha_entrega">En portería</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="p.estado === 'ENTREGADO' ? 'badge-emerald' : 'badge-amber'">
                    {{ p.estado === 'ENTREGADO' ? 'ENTREGADO' : 'EN CUSTODIA' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="actions-group">
                    <button 
                      *ngIf="p.estado !== 'ENTREGADO'" 
                      class="btn-action-deliver" 
                      (click)="abrirModalEntregar(p)" 
                      title="Entregar al residente">
                      Entregar
                    </button>
                    <button 
                      class="btn-action-delete" 
                      (click)="confirmarEliminarPaquete(p)" 
                      title="Eliminar registro">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="paquetesFiltrados.length === 0">
                <td colspan="8" class="empty-state">
                  <app-icon name="package" [size]="36" customClass="empty-icon"></app-icon>
                  <p class="empty-title">No hay paquetes registrados</p>
                  <p class="empty-desc">No se encontraron encomiendas con los criterios seleccionados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL REGISTRAR VISITA -->
      <div class="modal-backdrop" *ngIf="mostrarModalVisita">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Registrar Ingreso de Visita</h2>
              <p class="modal-subtitle">Control de portería y notificación automática al residente</p>
            </div>
            <button class="modal-close-btn" (click)="cerrarModalVisita()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre Completo del Visitante *</label>
              <input 
                type="text" 
                [(ngModel)]="nuevaVisita.visitante_nombre" 
                placeholder="Ej. Roberto Gómez, María López" 
                class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Cédula de Identidad (CI) *</label>
                <input 
                  type="text" 
                  [(ngModel)]="nuevaVisita.visitante_documento" 
                  placeholder="Ej. 6849201 LP" 
                  class="form-control" />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Unidad de Destino *</label>
                <select [(ngModel)]="nuevaVisita.unidad_id" class="form-control">
                  <option [ngValue]="null" disabled selected>Seleccione la unidad</option>
                  <option *ngFor="let u of unidades" [value]="u.id">Unidad {{ u.codigo }} ({{ u.tipo }})</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Placa de Vehículo (Si aplica)</label>
              <input 
                type="text" 
                [(ngModel)]="nuevaVisita.vehiculo_placa" 
                placeholder="Ej. 4021-XYZ (Dejar en blanco si ingresa a pie)" 
                class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones o Motivo</label>
              <input 
                type="text" 
                [(ngModel)]="nuevaVisita.observaciones" 
                placeholder="Ej. Visita familiar, Técnico de internet, Delivery" 
                class="form-control" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalVisita()">Cancelar</button>
            <button 
              class="btn btn-primary" 
              (click)="guardarVisita()" 
              [disabled]="!nuevaVisita.visitante_nombre || !nuevaVisita.visitante_documento || !nuevaVisita.unidad_id">
              <app-icon name="plus" [size]="15"></app-icon>
              <span>Registrar Ingreso</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL RECIBIR PAQUETE -->
      <div class="modal-backdrop" *ngIf="mostrarModalPaquete">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Recepción de Paquete / Encomienda</h2>
              <p class="modal-subtitle">Registro en custodia y notificación instantánea a la unidad</p>
            </div>
            <button class="modal-close-btn" (click)="cerrarModalPaquete()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Unidad de Destino *</label>
                <select [(ngModel)]="nuevoPaquete.unidad_id" class="form-control">
                  <option [ngValue]="null" disabled selected>Seleccione la unidad</option>
                  <option *ngFor="let u of unidades" [value]="u.id">Unidad {{ u.codigo }} ({{ u.tipo }})</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Nombre del Destinatario *</label>
                <input 
                  type="text" 
                  [(ngModel)]="nuevoPaquete.destinatario_nombre" 
                  placeholder="Ej. Juan Pérez" 
                  class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Empresa / Courier</label>
                <input 
                  type="text" 
                  [(ngModel)]="nuevoPaquete.empresa_transporte" 
                  placeholder="Ej. PedidosYa, DHL, FedEx, Amaszonas" 
                  class="form-control" />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Código / Guía de Rastreo</label>
                <input 
                  type="text" 
                  [(ngModel)]="nuevoPaquete.codigo_paquete" 
                  placeholder="Ej. GUIA-89421" 
                  class="form-control" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalPaquete()">Cancelar</button>
            <button 
              class="btn btn-primary" 
              (click)="guardarPaquete()" 
              [disabled]="!nuevoPaquete.unidad_id || !nuevoPaquete.destinatario_nombre">
              <app-icon name="package" [size]="15"></app-icon>
              <span>Recibir Paquete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ENTREGAR PAQUETE -->
      <div class="modal-backdrop" *ngIf="paqueteAEntregar">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Confirmar Entrega de Encomienda</h2>
              <p class="modal-subtitle">Registra la entrega física del paquete al residente</p>
            </div>
            <button class="modal-close-btn" (click)="paqueteAEntregar = null">✕</button>
          </div>

          <div class="modal-body">
            <div class="package-summary-card">
              <div><strong>Destinatario:</strong> {{ paqueteAEntregar.destinatario_nombre }}</div>
              <div><strong>Unidad:</strong> Unidad {{ paqueteAEntregar.unidad_codigo }}</div>
              <div><strong>Transporte:</strong> {{ paqueteAEntregar.empresa_transporte || 'Particular' }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Nombre de quien retira *</label>
              <input 
                type="text" 
                [(ngModel)]="entregadoA" 
                placeholder="Ej. Titular, Empleada, Familiar" 
                class="form-control" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="paqueteAEntregar = null">Cancelar</button>
            <button class="btn btn-primary" (click)="ejecutarEntrega()" [disabled]="!entregadoA.trim()">
              <app-icon name="check" [size]="15"></app-icon>
              <span>Confirmar Entrega</span>
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

    .visits-icon { background: #fef3c7; color: #b45309; }
    .package-icon { background: #e0f2fe; color: #0284c7; }
    .delivered-icon { background: #ecfdf5; color: #059669; }
    .qr-icon { background: #f1f5f9; color: #475569; }

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

    /* VALIDADOR QR */
    .qr-validator-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .validator-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .validator-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qr-icon-title {
      color: #059669;
    }

    .validator-title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    .validator-hint {
      font-size: 12px;
      color: #64748b;
    }

    .validator-input-row {
      display: flex;
      gap: 10px;
    }

    .qr-result-box {
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      animation: modalFadeIn 0.2s ease-out;
    }

    .qr-success {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }

    .qr-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .qr-result-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .qr-status-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      background: #ffffff;
      letter-spacing: 0.04em;
    }

    .qr-result-msg {
      font-size: 13px;
      font-weight: 600;
    }

    .qr-details-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: rgba(255, 255, 255, 0.7);
      padding: 10px 14px;
      border-radius: 8px;
    }

    .qr-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .qr-label {
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.8;
    }

    .qr-val {
      font-size: 12.5px;
      font-weight: 700;
    }

    /* TABS */
    .tabs-bar {
      display: flex;
      gap: 10px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      font-size: 13.5px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-btn.active {
      color: #059669;
      border-bottom-color: #059669;
    }

    .tab-filters {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
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

    /* TABLA */
    .visitor-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .visitor-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .visitor-obs {
      font-size: 11.5px;
      color: #64748b;
    }

    .ci-badge {
      font-family: monospace;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .unit-badge {
      font-size: 12px;
      font-weight: 700;
      color: #065f46;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .carrier-badge {
      font-size: 12px;
      font-weight: 600;
      color: #1e40af;
      background: #eff6ff;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .code-mono {
      font-family: monospace;
      font-size: 12px;
      color: #475569;
    }

    .plate-text {
      font-size: 12.5px;
      font-weight: 600;
      color: #1e293b;
    }

    .time-text {
      font-size: 12px;
      color: #475569;
    }

    .badge-amber {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-emerald {
      background: #dcfce7;
      color: #15803d;
    }

    .badge-neutral {
      background: #f1f5f9;
      color: #64748b;
    }

    .actions-group {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 6px;
    }

    .btn-action-checkout {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-action-checkout:hover {
      background: #fde68a;
    }

    .btn-action-deliver {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-action-deliver:hover {
      background: #bbf7d0;
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
      transition: all 0.15s ease;
    }

    .btn-action-delete:hover {
      background: #fee2e2;
    }

    .package-summary-card {
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
    }

    .receiver-sub {
      display: block;
      font-size: 10.5px;
      color: #64748b;
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
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 540px;
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

    .modal-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 12.5px;
      color: #64748b;
      margin: 4px 0 0;
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      font-size: 18px;
      color: #94a3b8;
      cursor: pointer;
    }

    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .modal-footer {
      padding: 14px 24px;
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
      outline: none;
    }

    .form-control:focus {
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

    .font-bold { font-weight: 700; }
  `]
})
export class ConserjeriaComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  tabActiva: 'visitas' | 'paquetes' = 'visitas';

  visitas: any[] = [];
  paquetes: any[] = [];
  unidades: any[] = [];

  // Filtros
  soloVisitasActivas: boolean = false;
  filtroTextoVisitas: string = '';
  filtroTextoPaquetes: string = '';
  filtroEstadoPaquetes: string = 'TODOS';

  // Validador QR
  codigoQR = '';
  qrResultado: any = null;

  // Modal Registrar Visita
  mostrarModalVisita = false;
  nuevaVisita: any = {
    visitante_nombre: '',
    visitante_documento: '',
    unidad_id: null,
    vehiculo_placa: '',
    observaciones: ''
  };

  // Modal Recibir Paquete
  mostrarModalPaquete = false;
  nuevoPaquete: any = {
    unidad_id: null,
    destinatario_nombre: '',
    empresa_transporte: '',
    codigo_paquete: ''
  };

  // Modal Entregar Paquete
  paqueteAEntregar: any = null;
  entregadoA: string = '';

  ngOnInit() {
    this.cargarDatos();
    this.cargarUnidades();
  }

  cargarDatos() {
    this.cargarVisitas();
    this.cargarPaquetes();
  }

  cargarVisitas() {
    if (this.soloVisitasActivas) {
      this.api.getVisitas().subscribe({
        next: (d) => this.visitas = d.items || [],
        error: (err) => console.error(err)
      });
    } else {
      this.api.getTodasVisitas().subscribe({
        next: (d) => this.visitas = d.items || [],
        error: (err) => console.error(err)
      });
    }
  }

  cargarPaquetes() {
    this.api.getPaqueteria().subscribe({
      next: (d) => this.paquetes = d.items || [],
      error: (err) => console.error(err)
    });
  }

  cargarUnidades() {
    this.api.getUnidades().subscribe({
      next: (d) => this.unidades = d.items || [],
      error: (err) => console.error(err)
    });
  }

  get totalVisitasActivas(): number {
    return this.visitas.filter(v => !v.fecha_salida).length;
  }

  get totalPaquetesEnCustodia(): number {
    return this.paquetes.filter(p => p.estado !== 'ENTREGADO').length;
  }

  get totalPaquetesEntregados(): number {
    return this.paquetes.filter(p => p.estado === 'ENTREGADO').length;
  }

  get visitasFiltradas(): any[] {
    return this.visitas.filter(v => {
      if (this.filtroTextoVisitas.trim()) {
        const q = this.filtroTextoVisitas.toLowerCase();
        const coincideNombre = v.visitante_nombre?.toLowerCase().includes(q);
        const coincideDoc = v.visitante_documento?.toLowerCase().includes(q);
        const coincideUnidad = v.unidad_codigo?.toLowerCase().includes(q);
        const coincidePlaca = v.vehiculo_placa?.toLowerCase().includes(q);
        if (!coincideNombre && !coincideDoc && !coincideUnidad && !coincidePlaca) return false;
      }
      return true;
    });
  }

  get paquetesFiltrados(): any[] {
    return this.paquetes.filter(p => {
      if (this.filtroEstadoPaquetes !== 'TODOS' && p.estado !== this.filtroEstadoPaquetes) {
        return false;
      }
      if (this.filtroTextoPaquetes.trim()) {
        const q = this.filtroTextoPaquetes.toLowerCase();
        const coincideDest = p.destinatario_nombre?.toLowerCase().includes(q);
        const coincideCod = p.codigo_paquete?.toLowerCase().includes(q);
        const coincideEmpresa = p.empresa_transporte?.toLowerCase().includes(q);
        const coincideUnidad = p.unidad_codigo?.toLowerCase().includes(q);
        if (!coincideDest && !coincideCod && !coincideEmpresa && !coincideUnidad) return false;
      }
      return true;
    });
  }

  // QR
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

  // VISITAS
  abrirModalVisita() {
    this.nuevaVisita = {
      visitante_nombre: '',
      visitante_documento: '',
      unidad_id: null,
      vehiculo_placa: '',
      observaciones: ''
    };
    this.mostrarModalVisita = true;
  }

  cerrarModalVisita() {
    this.mostrarModalVisita = false;
  }

  guardarVisita() {
    if (!this.nuevaVisita.visitante_nombre || !this.nuevaVisita.visitante_documento || !this.nuevaVisita.unidad_id) return;
    this.api.registrarVisita(this.nuevaVisita).subscribe({
      next: () => {
        this.cerrarModalVisita();
        this.cargarVisitas();
      },
      error: (err) => alert(err.error?.message || 'Error registrando visita')
    });
  }

  registrarSalida(v: any) {
    this.api.registrarSalidaVisita(v.id).subscribe({
      next: () => this.cargarVisitas(),
      error: (err) => alert(err.error?.message || 'Error registrando salida')
    });
  }

  async confirmarEliminarVisita(v: any) {
    const ok = await this.confirm.confirm({
      title: '¿Eliminar registro de visita?',
      message: `Eliminarás el registro de ingreso de <strong>${v.visitante_nombre}</strong> (CI: ${v.visitante_documento}). Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'trash'
    });

    if (ok) {
      this.api.eliminarVisita(v.id).subscribe({
        next: () => this.cargarVisitas(),
        error: (err) => alert(err.error?.message || 'Error al eliminar visita')
      });
    }
  }

  // PAQUETES
  abrirModalPaquete() {
    this.nuevoPaquete = {
      unidad_id: null,
      destinatario_nombre: '',
      empresa_transporte: '',
      codigo_paquete: ''
    };
    this.mostrarModalPaquete = true;
  }

  cerrarModalPaquete() {
    this.mostrarModalPaquete = false;
  }

  guardarPaquete() {
    if (!this.nuevoPaquete.unidad_id || !this.nuevoPaquete.destinatario_nombre) return;
    this.api.registrarPaquete(this.nuevoPaquete).subscribe({
      next: () => {
        this.cerrarModalPaquete();
        this.cargarPaquetes();
      },
      error: (err) => alert(err.error?.message || 'Error recibiendo paquete')
    });
  }

  abrirModalEntregar(p: any) {
    this.paqueteAEntregar = p;
    this.entregadoA = p.destinatario_nombre || '';
  }

  ejecutarEntrega() {
    if (!this.paqueteAEntregar || !this.entregadoA.trim()) return;
    this.api.entregarPaquete(this.paqueteAEntregar.id, this.entregadoA.trim()).subscribe({
      next: () => {
        this.paqueteAEntregar = null;
        this.cargarPaquetes();
      },
      error: (err) => alert(err.error?.message || 'Error entregando paquete')
    });
  }

  async confirmarEliminarPaquete(p: any) {
    const ok = await this.confirm.confirm({
      title: '¿Eliminar registro de encomienda?',
      message: `Eliminarás la encomienda para <strong>${p.destinatario_nombre}</strong> (Unidad ${p.unidad_codigo}). Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'trash'
    });

    if (ok) {
      this.api.eliminarPaquete(p.id).subscribe({
        next: () => this.cargarPaquetes(),
        error: (err) => alert(err.error?.message || 'Error al eliminar paquete')
      });
    }
  }
}
