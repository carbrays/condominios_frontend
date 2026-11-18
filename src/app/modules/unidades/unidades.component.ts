import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="unidades-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="tag-row">
            <span class="badge badge-rf">RF-01</span>
            <span class="badge badge-slate">Catastro y Alícuotas</span>
          </div>
          <h1 class="page-title">Catastro de Unidades y Alícuotas</h1>
          <p class="page-subtitle">
            Departamentos, parqueos, bauleras, folios reales, titulares y contratos de inquilinos
          </p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nueva Unidad</span>
        </button>
      </div>

      <!-- ESTADÍSTICAS Y RESUMEN CATASTRAL -->
      <div class="kpis-summary-bar">
        <div class="summary-pill">
          <span class="summary-label">Total Unidades:</span>
          <strong class="summary-value">{{ unidades.length }}</strong>
        </div>
        <div class="summary-pill">
          <span class="summary-label">Suma Alícuotas:</span>
          <strong class="summary-value" [class.text-emerald]="totalAlicuotas >= 99 && totalAlicuotas <= 101">
            {{ totalAlicuotas | number:'1.2-2' }}%
          </strong>
        </div>
        <div class="summary-pill">
          <span class="summary-label">Ocupadas:</span>
          <strong class="summary-value text-emerald">{{ unidadesOcupadas }}</strong>
        </div>
        <div class="summary-pill">
          <span class="summary-label">Disponibles:</span>
          <strong class="summary-value">{{ unidadesDisponibles }}</strong>
        </div>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <div class="search-filter-row">
        <div class="search-input-box">
          <div class="search-box-container">
            <app-icon name="search" [size]="16" customClass="search-icon-left"></app-icon>
            <input 
              type="search" 
              [(ngModel)]="searchQuery" 
              (input)="onSearch()" 
              placeholder="Buscar por código (ej. DEP-101), residente o propietario..." 
              class="clean-search-input"
            />
            <button 
              *ngIf="searchQuery" 
              type="button" 
              class="clean-clear-btn" 
              (click)="limpiarBusqueda()"
              title="Borrar texto">
              ✕
            </button>
          </div>
        </div>
        <div class="filter-pills">
          <button 
            class="filter-pill" 
            [class.active]="filtroTipo === 'TODOS'" 
            (click)="filtroTipo = 'TODOS'">
            Todos
          </button>
          <button 
            class="filter-pill" 
            [class.active]="filtroTipo === 'DEPARTAMENTO'" 
            (click)="filtroTipo = 'DEPARTAMENTO'">
            Departamentos
          </button>
          <button 
            class="filter-pill" 
            [class.active]="filtroTipo === 'PARQUEO'" 
            (click)="filtroTipo = 'PARQUEO'">
            Parqueos
          </button>
          <button 
            class="filter-pill" 
            [class.active]="filtroTipo === 'BAULERA'" 
            (click)="filtroTipo = 'BAULERA'">
            Bauleras
          </button>
        </div>
      </div>

      <!-- TABLA CATASTRAL DE UNIDADES -->
      <div class="table-container">
        <table class="ui-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Bloque / Nivel</th>
              <th>Alícuota Legal</th>
              <th>Estado</th>
              <th>Copropietario Legal</th>
              <th>Residente Actual</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of unidadesFiltradas">
              <td>
                <span class="unit-code">{{ u.codigo }}</span>
              </td>
              <td>
                <span class="badge badge-slate">{{ u.tipo_nombre || u.tipo_unidad_id }}</span>
              </td>
              <td>
                <span class="level-text">{{ u.bloque_nombre || 'Torre A' }} • {{ u.piso_nombre || 'Nivel 1' }}</span>
              </td>
              <td>
                <span class="alicuota-badge">{{ (u.alicuota * 100) | number:'1.2-2' }}%</span>
              </td>
              <td>
                <span 
                  class="badge" 
                  [class.badge-accent]="u.estado === 'OCUPADA'"
                  [class.badge-warning]="u.estado !== 'OCUPADA'">
                  {{ u.estado }}
                </span>
              </td>
              <td>
                <div *ngIf="u.propietarios && u.propietarios.length > 0" class="person-cell">
                  <strong>{{ u.propietarios[0]?.nombres }} {{ u.propietarios[0]?.apellidos }}</strong>
                  <span class="ci-sub" *ngIf="u.propietarios[0]?.ci">CI: {{ u.propietarios[0]?.ci }}</span>
                </div>
                <span *ngIf="!u.propietarios || u.propietarios.length === 0" class="text-unassigned">
                  Sin propietario
                </span>
              </td>
              <td>
                <div *ngIf="u.residente_actual" class="person-cell">
                  <strong>{{ u.residente_actual?.nombres }} {{ u.residente_actual?.apellidos }}</strong>
                  <span class="ci-sub" *ngIf="u.residente_actual?.ci">CI: {{ u.residente_actual?.ci }}</span>
                </div>
                <span *ngIf="!u.residente_actual" class="text-unassigned">
                  Sin residente
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-btn-group">
                  <button 
                    class="btn btn-outline btn-sm" 
                    (click)="abrirModalPropietario(u)" 
                    title="Vincular Propietario Legal">
                    🔑 Dueño
                  </button>
                  <button 
                    class="btn btn-outline btn-sm" 
                    (click)="abrirModalInquilino(u)" 
                    title="Vincular Contrato de Inquilino">
                    📋 Inquilino
                  </button>
                  <button 
                    class="btn btn-outline btn-sm" 
                    (click)="abrirModalEditar(u)" 
                    title="Editar Unidad">
                    Editar
                  </button>
                  <button 
                    class="btn btn-outline btn-sm btn-del" 
                    (click)="eliminar(u)" 
                    title="Eliminar Unidad">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="unidadesFiltradas.length === 0">
              <td colspan="8" class="empty-row">
                No se encontraron unidades registradas con los filtros actuales.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL CREAR / EDITAR UNIDAD -->
      <div class="modal-backdrop" *ngIf="showModalUnidad">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="badge badge-rf">{{ editandoId ? 'Actualizar Catastro' : 'Nueva Unidad' }}</span>
              <h3 class="modal-title">{{ editandoId ? 'Editar Unidad ' + formUnidad.codigo : 'Registrar Nueva Unidad' }}</h3>
            </div>
            <button class="btn-close" (click)="cerrarModalUnidad()">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="errorUnidad" class="alert-error">{{ errorUnidad }}</div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Código de Unidad *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formUnidad.codigo" 
                  class="ui-input form-control" 
                  placeholder="ej. DEP-301, PK-12, BAUL-04" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Tipo de Unidad *</label>
                <select [(ngModel)]="formUnidad.tipo_unidad_id" class="ui-select form-control">
                  <option value="DEPARTAMENTO">Departamento</option>
                  <option value="PARQUEO">Parqueo</option>
                  <option value="BAULERA">Baulera</option>
                  <option value="LOCAL">Local Comercial</option>
                  <option value="OFICINA">Oficina</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Alícuota Legal (% o decimal) *</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  [(ngModel)]="formUnidad.alicuota" 
                  class="ui-input form-control" 
                  placeholder="ej. 0.0485 para 4.85%" 
                />
                <span class="hint-text">Valor representativo: {{ (formUnidad.alicuota * 100) | number:'1.2-2' }}%</span>
              </div>

              <div class="form-group">
                <label class="form-label">Metros Cuadrados (m²)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  [(ngModel)]="formUnidad.metros_cuadrados" 
                  class="ui-input form-control" 
                  placeholder="ej. 85.50" 
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="cerrarModalUnidad()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardarUnidad()" [disabled]="saving">
              {{ saving ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Crear Unidad') }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ASIGNAR PROPIETARIO LEGAL -->
      <div class="modal-backdrop" *ngIf="showModalPropietario">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="badge badge-rf">RF-02 Derechos Reales</span>
              <h3 class="modal-title">Asignar Propietario a {{ selectedUnidad?.codigo }}</h3>
            </div>
            <button class="btn-close" (click)="showModalPropietario = false">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="errorAsignacion" class="alert-error">{{ errorAsignacion }}</div>
            
            <div class="form-group">
              <label class="form-label">Buscar Persona por Cédula (CI) *</label>
              <div class="search-ci-box">
                <div class="search-box-container" style="flex: 1;">
                  <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
                  <input 
                    type="search" 
                    [(ngModel)]="ciPersona" 
                    placeholder="ej. 6849201" 
                    (keyup.enter)="buscarPersona()"
                    class="clean-search-input"
                  />
                  <button 
                    *ngIf="ciPersona" 
                    type="button" 
                    class="clean-clear-btn" 
                    (click)="ciPersona = ''; personaSeleccionada = null" 
                    title="Borrar CI">
                    ✕
                  </button>
                </div>
                <button type="button" class="btn btn-outline" (click)="buscarPersona()">
                  Buscar
                </button>
              </div>
            </div>

            <div *ngIf="personaSeleccionada" class="persona-card-selected">
              <div class="avatar-circle">
                {{ personaSeleccionada.nombres[0] }}{{ personaSeleccionada.apellidos[0] }}
              </div>
              <div>
                <strong>{{ personaSeleccionada.nombres }} {{ personaSeleccionada.apellidos }}</strong>
                <span>CI: {{ personaSeleccionada.ci }} {{ personaSeleccionada.ci_expedicion || 'SC' }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Porcentaje de Propiedad (%)</label>
              <input 
                type="number" 
                [(ngModel)]="propiedadForm.porcentaje" 
                class="ui-input form-control" 
                placeholder="100" 
              />
            </div>

            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="propiedadForm.esTitular" />
              <span>Es el Titular Principal para votaciones y asambleas</span>
            </label>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showModalPropietario = false">Cancelar</button>
            <button 
              class="btn btn-primary" 
              [disabled]="!personaSeleccionada || saving" 
              (click)="guardarPropietario()">
              {{ saving ? 'Guardando...' : 'Vincular Propietario' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ASIGNAR INQUILINO / CONTRATO -->
      <div class="modal-backdrop" *ngIf="showModalInquilino">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="badge badge-rf">RF-03 Contrato de Residencia</span>
              <h3 class="modal-title">Registrar Inquilino en {{ selectedUnidad?.codigo }}</h3>
            </div>
            <button class="btn-close" (click)="showModalInquilino = false">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="errorAsignacion" class="alert-error">{{ errorAsignacion }}</div>

            <div class="form-group">
              <label class="form-label">Buscar Inquilino por Cédula (CI) *</label>
              <div class="search-ci-box">
                <div class="search-box-container" style="flex: 1;">
                  <app-icon name="search" [size]="15" customClass="search-icon-left"></app-icon>
                  <input 
                    type="search" 
                    [(ngModel)]="ciPersona" 
                    placeholder="ej. 7543210" 
                    (keyup.enter)="buscarPersona()"
                    class="clean-search-input"
                  />
                  <button 
                    *ngIf="ciPersona" 
                    type="button" 
                    class="clean-clear-btn" 
                    (click)="ciPersona = ''; personaSeleccionada = null" 
                    title="Borrar CI">
                    ✕
                  </button>
                </div>
                <button type="button" class="btn btn-outline" (click)="buscarPersona()">
                  Buscar
                </button>
              </div>
            </div>

            <div *ngIf="personaSeleccionada" class="persona-card-selected">
              <div class="avatar-circle">
                {{ personaSeleccionada.nombres[0] }}{{ personaSeleccionada.apellidos[0] }}
              </div>
              <div>
                <strong>{{ personaSeleccionada.nombres }} {{ personaSeleccionada.apellidos }}</strong>
                <span>CI: {{ personaSeleccionada.ci }} {{ personaSeleccionada.ci_expedicion || 'SC' }}</span>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Fecha de Inicio *</label>
                <input type="date" [(ngModel)]="contratoForm.fechaInicio" class="ui-input form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Fecha Fin (Vencimiento)</label>
                <input type="date" [(ngModel)]="contratoForm.fechaFin" class="ui-input form-control" />
              </div>
            </div>

            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="contratoForm.responsablePago" />
              <span>Delegar responsabilidad directa de pago de expensas (RF-03)</span>
            </label>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showModalInquilino = false">Cancelar</button>
            <button 
              class="btn btn-primary" 
              [disabled]="!personaSeleccionada || saving" 
              (click)="guardarInquilino()">
              {{ saving ? 'Guardando...' : 'Registrar Residencia' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unidades-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
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

    /* BARRA DE RESUMEN */
    .kpis-summary-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .summary-pill {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      box-shadow: var(--card-shadow);
    }

    .summary-label {
      color: var(--muted);
      font-weight: 500;
    }

    .summary-value {
      color: var(--ink);
      font-weight: 700;
    }

    .text-emerald {
      color: #059669;
    }

    /* BÚSQUEDA Y FILTROS */
    .search-filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-input-box {
      position: relative;
      flex: 1;
      max-width: 440px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted-light);
    }

    .search-field {
      width: 100%;
      padding-left: 36px;
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

    .unit-code {
      font-weight: 700;
      color: var(--ink);
      font-size: 13.5px;
    }

    .level-text {
      color: var(--muted);
      font-size: 12.5px;
    }

    .alicuota-badge {
      font-family: monospace;
      font-weight: 700;
      color: #047857;
      background: #ecfdf5;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 12px;
    }

    .person-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 12.5px;
    }

    .ci-sub {
      font-size: 11px;
      color: var(--muted);
      font-family: monospace;
    }

    .text-unassigned {
      color: var(--muted-light);
      font-style: italic;
      font-size: 12px;
    }

    .action-btn-group {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }

    .btn-del:hover {
      background-color: var(--danger-light);
      border-color: #fca5a5;
      color: var(--danger-text);
    }

    .empty-row {
      text-align: center;
      padding: 32px 16px;
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

    .hint-text {
      font-size: 11px;
      color: var(--muted);
    }

    .search-ci-box {
      display: flex;
      gap: 8px;
    }

    .persona-card-selected {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #166534;
      font-size: 13px;
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: #bbf7d0;
      color: #166534;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink);
      cursor: pointer;
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
export class UnidadesComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  unidades: any[] = [];
  searchQuery: string = '';
  filtroTipo: string = 'TODOS';
  saving: boolean = false;

  // Modales
  showModalUnidad: boolean = false;
  showModalPropietario: boolean = false;
  showModalInquilino: boolean = false;

  selectedUnidad: any = null;
  editandoId: number | null = null;
  errorUnidad: string = '';
  errorAsignacion: string = '';

  formUnidad: any = {
    codigo: '',
    tipo_unidad_id: 'DEPARTAMENTO',
    alicuota: 0.05,
    metros_cuadrados: null
  };

  ciPersona: string = '';
  personaSeleccionada: any = null;

  propiedadForm = {
    porcentaje: 100,
    esTitular: true
  };

  contratoForm = {
    fechaInicio: new Date().toISOString().substring(0, 10),
    fechaFin: '',
    responsablePago: true
  };

  get totalAlicuotas(): number {
    return this.unidades.reduce((acc, u) => acc + (Number(u.alicuota) || 0) * 100, 0);
  }

  get unidadesOcupadas(): number {
    return this.unidades.filter(u => u.estado === 'OCUPADA').length;
  }

  get unidadesDisponibles(): number {
    return this.unidades.filter(u => u.estado !== 'OCUPADA').length;
  }

  get unidadesFiltradas(): any[] {
    let result = this.unidades;

    if (this.filtroTipo !== 'TODOS') {
      result = result.filter(u => (u.tipo_nombre || u.tipo_unidad_id) === this.filtroTipo);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u => 
        u.codigo?.toLowerCase().includes(q) ||
        u.propietarios?.[0]?.nombres?.toLowerCase().includes(q) ||
        u.propietarios?.[0]?.apellidos?.toLowerCase().includes(q) ||
        u.residente_actual?.nombres?.toLowerCase().includes(q) ||
        u.residente_actual?.apellidos?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  ngOnInit() {
    this.cargarUnidades();
  }

  cargarUnidades() {
    this.api.getUnidades(1, 100).subscribe({
      next: (data) => {
        this.unidades = Array.isArray(data) ? data : (data?.items || []);
      },
      error: (err) => console.error('Error al cargar unidades:', err)
    });
  }

  onSearch() {
    // Filtrado reactivo en memoria
  }

  limpiarBusqueda() {
    this.searchQuery = '';
  }

  abrirModalCrear() {
    this.editandoId = null;
    this.errorUnidad = '';
    this.formUnidad = {
      codigo: '',
      tipo_unidad_id: 'DEPARTAMENTO',
      alicuota: 0.05,
      metros_cuadrados: null
    };
    this.showModalUnidad = true;
  }

  abrirModalEditar(u: any) {
    this.editandoId = u.id;
    this.errorUnidad = '';
    this.formUnidad = {
      codigo: u.codigo,
      tipo_unidad_id: u.tipo_unidad_id || 'DEPARTAMENTO',
      alicuota: u.alicuota,
      metros_cuadrados: u.metros_cuadrados || null
    };
    this.showModalUnidad = true;
  }

  cerrarModalUnidad() {
    this.showModalUnidad = false;
    this.editandoId = null;
    this.errorUnidad = '';
  }

  guardarUnidad() {
    if (!this.formUnidad.codigo || !this.formUnidad.alicuota) {
      this.errorUnidad = 'Código de unidad y alícuota son obligatorios.';
      return;
    }

    this.saving = true;
    this.errorUnidad = '';

    if (this.editandoId) {
      this.api.actualizarUnidad(this.editandoId, this.formUnidad).subscribe({
        next: () => {
          this.saving = false;
          this.cerrarModalUnidad();
          this.cargarUnidades();
        },
        error: (err) => {
          this.errorUnidad = err.error?.message || 'Error al actualizar unidad';
          this.saving = false;
        }
      });
    } else {
      this.api.crearUnidad(this.formUnidad).subscribe({
        next: () => {
          this.saving = false;
          this.cerrarModalUnidad();
          this.cargarUnidades();
        },
        error: (err) => {
          this.errorUnidad = err.error?.message || 'Error al crear unidad';
          this.saving = false;
        }
      });
    }
  }

  async eliminar(u: any) {
    const confirmado = await this.confirm.confirm({
      title: '¿Eliminar unidad catastral?',
      message: `Darás de baja la unidad <strong>${u.codigo}</strong> (${u.tipo_nombre || u.tipo_unidad_id || 'Unidad'}) del catastro. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'trash'
    });

    if (confirmado) {
      this.api.eliminarUnidad(u.id).subscribe({
        next: () => this.cargarUnidades(),
        error: (err) => alert(err.error?.message || 'No se pudo eliminar la unidad.')
      });
    }
  }

  abrirModalPropietario(unidad: any) {
    this.selectedUnidad = unidad;
    this.ciPersona = '';
    this.personaSeleccionada = null;
    this.errorAsignacion = '';
    this.propiedadForm = { porcentaje: 100, esTitular: true };
    this.showModalPropietario = true;
  }

  abrirModalInquilino(unidad: any) {
    this.selectedUnidad = unidad;
    this.ciPersona = '';
    this.personaSeleccionada = null;
    this.errorAsignacion = '';
    this.contratoForm = {
      fechaInicio: new Date().toISOString().substring(0, 10),
      fechaFin: '',
      responsablePago: true
    };
    this.showModalInquilino = true;
  }

  buscarPersona() {
    if (!this.ciPersona.trim()) return;
    this.errorAsignacion = '';
    this.api.buscarPersonaPorCI(this.ciPersona.trim()).subscribe({
      next: (res) => this.personaSeleccionada = res,
      error: () => {
        this.personaSeleccionada = null;
        this.errorAsignacion = 'No se encontró persona con ese CI. Puedes registrarla en Personas y Residentes.';
      }
    });
  }

  guardarPropietario() {
    if (!this.personaSeleccionada || !this.selectedUnidad) return;
    this.saving = true;
    const payload = {
      unidad_id: this.selectedUnidad.id,
      persona_id: this.personaSeleccionada.id,
      porcentaje_propiedad: this.propiedadForm.porcentaje,
      es_titular_principal: this.propiedadForm.esTitular
    };
    this.api.asignarPropietario(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showModalPropietario = false;
        this.cargarUnidades();
      },
      error: (err) => {
        this.saving = false;
        this.errorAsignacion = err?.error?.message || 'Error al asignar propietario';
      }
    });
  }

  guardarInquilino() {
    if (!this.personaSeleccionada || !this.selectedUnidad) return;
    this.saving = true;
    const payload = {
      unidad_id: this.selectedUnidad.id,
      persona_id: this.personaSeleccionada.id,
      fecha_inicio: this.contratoForm.fechaInicio,
      fecha_fin: this.contratoForm.fechaFin || null,
      responsable_pago: this.contratoForm.responsablePago
    };
    this.api.crearContratoResidencia(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showModalInquilino = false;
        this.cargarUnidades();
      },
      error: (err) => {
        this.saving = false;
        this.errorAsignacion = err?.error?.message || 'Error al registrar contrato de residencia';
      }
    });
  }
}
