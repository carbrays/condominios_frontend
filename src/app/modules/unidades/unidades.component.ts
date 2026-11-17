import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Unidad } from '../../core/models/models';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestión de Unidades Habitacionales</h1>
          <p>Departamentos, casas, parqueos, asignación de dueños y contratos de inquilinos</p>
        </div>
        <button class="btn-primary" (click)="showModal = true">+ Nueva Unidad</button>
      </div>

      <!-- TABLA DE UNIDADES -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Bloque / Piso</th>
              <th>Alícuota</th>
              <th>Estado</th>
              <th>Propietario Legal</th>
              <th>Residente Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of unidades">
              <td class="font-bold">{{ u.codigo }}</td>
              <td><span class="badge badge-tipo">{{ u.tipo_nombre || u.tipo_unidad_id }}</span></td>
              <td>{{ u.bloque_nombre || 'N/A' }} • {{ u.piso_nombre || 'Piso 1' }}</td>
              <td>{{ (u.alicuota * 100) | number:'1.2-2' }}%</td>
              <td>
                <span class="badge" [ngClass]="u.estado === 'OCUPADA' ? 'badge-success' : 'badge-warning'">
                  {{ u.estado }}
                </span>
              </td>
              <td>
                <span *ngIf="u.propietarios && u.propietarios.length > 0">
                  {{ u.propietarios[0]?.nombres }} {{ u.propietarios[0]?.apellidos }}
                </span>
                <span *ngIf="!u.propietarios || u.propietarios.length === 0" class="text-muted">Sin propietario</span>
              </td>
              <td>
                <span *ngIf="u.residente_actual">
                  {{ u.residente_actual?.nombres }} {{ u.residente_actual?.apellidos }}
                </span>
                <span *ngIf="!u.residente_actual" class="text-muted">Sin inquilino</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action btn-propietario" (click)="abrirModalPropietario(u)" title="Asignar Propietario">
                    🔑 Dueño
                  </button>
                  <button class="btn-action btn-inquilino" (click)="abrirModalInquilino(u)" title="Asignar Inquilino">
                    📋 Inquilino
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="unidades.length === 0">
              <td colspan="8" class="empty-state">No hay unidades registradas en este condominio.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL CREACIÓN DE UNIDAD -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Registrar Nueva Unidad</h3>
            <button class="btn-close" (click)="showModal = false">✖</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Código de Unidad (ej. DEP-301, CASA-12, PK-05)</label>
              <input type="text" [(ngModel)]="nuevaUnidad.codigo" class="form-control">
            </div>
            <div class="form-group">
              <label>Tipo de Unidad</label>
              <select [(ngModel)]="nuevaUnidad.tipo_unidad_id" class="form-control">
                <option value="DEPARTAMENTO">Departamento</option>
                <option value="PARQUEO">Parqueo</option>
                <option value="BAULERA">Baulera</option>
                <option value="LOCAL">Local Comercial</option>
              </select>
            </div>
            <div class="form-group">
              <label>Alícuota (ej. 0.05 para 5%)</label>
              <input type="number" step="0.0001" [(ngModel)]="nuevaUnidad.alicuota" class="form-control">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showModal = false">Cancelar</button>
            <button class="btn-primary" (click)="guardarUnidad()">Guardar</button>
          </div>
        </div>
      </div>

      <!-- MODAL ASIGNAR PROPIETARIO -->
      <div class="modal-backdrop" *ngIf="showModalPropietario">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Asignar Propietario Legal a {{ selectedUnidad?.codigo }}</h3>
            <button class="btn-close" (click)="showModalPropietario = false">✖</button>
          </div>
          <div class="modal-body">
            <div *ngIf="errorAsignacion" class="alert-error">{{ errorAsignacion }}</div>
            
            <div class="form-group">
              <label>Buscar Persona por CI *</label>
              <div class="search-ci-box">
                <input type="text" [(ngModel)]="ciPersona" class="form-control" placeholder="Ej. 4000004">
                <button type="button" class="btn-secondary" (click)="buscarPersona()">🔍 Buscar</button>
              </div>
            </div>

            <div *ngIf="personaSeleccionada" class="persona-badge">
              <strong>{{ personaSeleccionada.nombres }} {{ personaSeleccionada.apellidos }}</strong>
              <span>CI: {{ personaSeleccionada.ci }}</span>
            </div>

            <div class="form-group">
              <label>Porcentaje de Propiedad (%)</label>
              <input type="number" [(ngModel)]="propiedadForm.porcentaje" class="form-control">
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="propiedadForm.esTitular"> Es el Titular Principal
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showModalPropietario = false">Cancelar</button>
            <button class="btn-primary" [disabled]="!personaSeleccionada" (click)="guardarPropietario()">
              Vincular Propietario
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL ASIGNAR INQUILINO (CONTRATO RESIDENCIA) -->
      <div class="modal-backdrop" *ngIf="showModalInquilino">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Registrar Inquilino en {{ selectedUnidad?.codigo }}</h3>
            <button class="btn-close" (click)="showModalInquilino = false">✖</button>
          </div>
          <div class="modal-body">
            <div *ngIf="errorAsignacion" class="alert-error">{{ errorAsignacion }}</div>

            <div class="form-group">
              <label>Buscar Persona por CI *</label>
              <div class="search-ci-box">
                <input type="text" [(ngModel)]="ciPersona" class="form-control" placeholder="Ej. 5000005">
                <button type="button" class="btn-secondary" (click)="buscarPersona()">🔍 Buscar</button>
              </div>
            </div>

            <div *ngIf="personaSeleccionada" class="persona-badge">
              <strong>{{ personaSeleccionada.nombres }} {{ personaSeleccionada.apellidos }}</strong>
              <span>CI: {{ personaSeleccionada.ci }}</span>
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label>Fecha Inicio *</label>
                <input type="date" [(ngModel)]="contratoForm.fechaInicio" class="form-control">
              </div>
              <div class="form-group col">
                <label>Fecha Fin (Vencimiento)</label>
                <input type="date" [(ngModel)]="contratoForm.fechaFin" class="form-control">
              </div>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="contratoForm.responsablePago"> Es el Responsable de Pago de Expensas
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showModalInquilino = false">Cancelar</button>
            <button class="btn-primary" [disabled]="!personaSeleccionada" (click)="guardarInquilino()">
              Registrar Residencia
            </button>
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
    .btn-secondary { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 14px 16px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .font-bold { font-weight: 700; color: #0f172a; }
    .text-muted { color: #94a3b8; font-style: italic; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .badge-tipo { background: #f1f5f9; color: #475569; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .action-buttons { display: flex; gap: 6px; }
    .btn-action { padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; }
    .btn-propietario { background: #e0f2fe; color: #0369a1; }
    .btn-propietario:hover { background: #bae6fd; }
    .btn-inquilino { background: #fef3c7; color: #b45309; }
    .btn-inquilino:hover { background: #fde68a; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
    .modal-content { background: #fff; width: 100%; max-width: 460px; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 16px; color: #0f172a; font-weight: 700; }
    .btn-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: 75vh; overflow-y: auto; }
    .modal-footer { padding: 14px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #334155; }
    .form-control { padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; width: 100%; }
    .search-ci-box { display: flex; gap: 8px; }
    .search-ci-box input { flex: 1; }
    .persona-badge { padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; display: flex; flex-direction: column; gap: 2px; color: #166534; font-size: 13px; }
    .form-row { display: flex; gap: 12px; }
    .col { flex: 1; }
    .alert-error { padding: 10px 14px; background: #fee2e2; color: #991b1b; border-radius: 8px; font-size: 13px; }
    .empty-state { padding: 32px; text-align: center; color: #64748b; }
  `]
})
export class UnidadesComponent implements OnInit {
  private api = inject(ApiService);

  unidades: any[] = [];
  showModal = false;
  showModalPropietario = false;
  showModalInquilino = false;
  selectedUnidad: any = null;

  ciPersona = '';
  personaSeleccionada: any = null;
  errorAsignacion = '';

  nuevaUnidad = {
    codigo: '',
    tipo_unidad_id: 'DEPARTAMENTO',
    alicuota: 0.05
  };

  propiedadForm = {
    porcentaje: 100,
    esTitular: true
  };

  contratoForm = {
    fechaInicio: new Date().toISOString().substring(0, 10),
    fechaFin: '',
    responsablePago: true
  };

  ngOnInit() {
    this.cargarUnidades();
  }

  cargarUnidades() {
    this.api.getUnidades().subscribe((data) => {
      this.unidades = Array.isArray(data) ? data : (data?.items || []);
    });
  }

  guardarUnidad() {
    this.api.crearUnidad(this.nuevaUnidad).subscribe(() => {
      this.showModal = false;
      this.cargarUnidades();
    });
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
        this.errorAsignacion = 'No se encontró ninguna persona con ese CI. Regístrala primero en Membresías.';
      }
    });
  }

  guardarPropietario() {
    if (!this.personaSeleccionada || !this.selectedUnidad) return;
    const payload = {
      unidad_id: this.selectedUnidad.id,
      persona_id: this.personaSeleccionada.id,
      porcentaje_propiedad: this.propiedadForm.porcentaje,
      es_titular_principal: this.propiedadForm.esTitular
    };
    this.api.asignarPropietario(payload).subscribe({
      next: () => {
        this.showModalPropietario = false;
        this.cargarUnidades();
      },
      error: (err) => {
        this.errorAsignacion = err?.error?.message || 'Error al asignar propietario';
      }
    });
  }

  guardarInquilino() {
    if (!this.personaSeleccionada || !this.selectedUnidad) return;
    const payload = {
      unidad_id: this.selectedUnidad.id,
      persona_id: this.personaSeleccionada.id,
      fecha_inicio: this.contratoForm.fechaInicio,
      fecha_fin: this.contratoForm.fechaFin || null,
      responsable_pago: this.contratoForm.responsablePago
    };
    this.api.crearContratoResidencia(payload).subscribe({
      next: () => {
        this.showModalInquilino = false;
        this.cargarUnidades();
      },
      error: (err) => {
        this.errorAsignacion = err?.error?.message || 'Error al registrar contrato de residencia';
      }
    });
  }
}
