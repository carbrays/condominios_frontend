import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Persona } from '../../core/models/models';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="personas-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="tag-row">
            <span class="badge badge-rf">RF-02 / RF-03</span>
            <span class="badge badge-slate">Padrón de Residentes</span>
          </div>
          <h1 class="page-title">Directorio de Personas y Residentes</h1>
          <p class="page-subtitle">
            Registro civil de copropietarios, inquilinos, apoderados y personal autorizado
          </p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Registrar Persona</span>
        </button>
      </div>

      <!-- BARRA DE BÚSQUEDA Y ESTADÍSTICAS -->
      <div class="search-stats-bar">
        <div class="search-input-box">
          <div class="search-box-container">
            <app-icon name="search" [size]="16" customClass="search-icon-left"></app-icon>
            <input 
              type="search" 
              [(ngModel)]="searchQuery" 
              (input)="onSearchChange()" 
              placeholder="Buscar por CI, nombre, apellido o correo electrónico..." 
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
        <div class="stats-pills">
          <span class="stat-pill">
            <strong>{{ totalPersonas }}</strong> registradas
          </span>
        </div>
      </div>

      <!-- TABLA DE PERSONAS -->
      <div class="table-container">
        <table class="ui-table">
          <thead>
            <tr>
              <th>Cédula (CI)</th>
              <th>Nombre Completo</th>
              <th>Contacto</th>
              <th>Email</th>
              <th>Acceso al Sistema</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of personas">
              <td>
                <div class="ci-box">
                  <span class="ci-number">{{ p.ci }}</span>
                  <span class="badge badge-slate ci-exp">{{ p.ci_expedicion || 'SC' }}</span>
                </div>
              </td>
              <td>
                <div class="user-row">
                  <div class="avatar-circle">
                    {{ getInitials(p.nombres, p.apellidos) }}
                  </div>
                  <div>
                    <strong class="user-fullname">{{ p.nombres }} {{ p.apellidos }}</strong>
                    <span class="alt-address" *ngIf="p.direccion_alternativa">{{ p.direccion_alternativa }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="phone-text">{{ p.telefono || 'Sin teléfono' }}</span>
              </td>
              <td>
                <span class="email-text">{{ p.email || 'Sin correo' }}</span>
              </td>
              <td>
                <span 
                  class="badge" 
                  [class.badge-accent]="p.usuario_id && p.usuario_activo"
                  [class.badge-slate]="!p.usuario_id">
                  {{ p.usuario_id ? (p.usuario_activo ? 'Usuario Activo' : 'Inactivo') : 'Sin Usuario' }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-btn-group">
                  <button 
                    class="btn btn-outline btn-sm" 
                    (click)="abrirModalEditar(p)" 
                    title="Editar datos personales">
                    Editar
                  </button>
                  <button 
                    class="btn btn-outline btn-sm btn-del" 
                    (click)="eliminar(p)" 
                    title="Dar de baja">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="personas.length === 0 && !loading">
              <td colspan="6" class="empty-row">
                No se encontraron personas registradas con el criterio de búsqueda.
              </td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="6" class="empty-row">
                Cargando directorio...
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL CREAR / EDITAR PERSONA -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="badge badge-rf">{{ editandoId ? 'Actualización' : 'Nuevo Registro' }}</span>
              <h3 class="modal-title">{{ editandoId ? 'Editar Persona' : 'Registrar Nueva Persona' }}</h3>
            </div>
            <button class="btn-close" (click)="cerrarModal()">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="errorMessage" class="alert-error">
              {{ errorMessage }}
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Cédula de Identidad (CI) *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.ci" 
                  class="ui-input form-control" 
                  placeholder="ej. 6849201" 
                  [disabled]="!!editandoId"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Expedición</label>
                <select [(ngModel)]="formData.ci_expedicion" class="ui-select form-control">
                  <option value="SC">Santa Cruz (SC)</option>
                  <option value="LP">La Paz (LP)</option>
                  <option value="CB">Cochabamba (CB)</option>
                  <option value="OR">Oruro (OR)</option>
                  <option value="PT">Potosí (PT)</option>
                  <option value="TJ">Tarija (TJ)</option>
                  <option value="CH">Chuquisaca (CH)</option>
                  <option value="BE">Beni (BE)</option>
                  <option value="PD">Pando (PD)</option>
                  <option value="EXT">Extranjero (EXT)</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nombres *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.nombres" 
                  class="ui-input form-control" 
                  placeholder="ej. Juan Carlos" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Apellidos *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.apellidos" 
                  class="ui-input form-control" 
                  placeholder="ej. Aguilera Vaca" 
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Teléfono / Celular WhatsApp</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.telefono" 
                  class="ui-input form-control" 
                  placeholder="ej. +591 76543210" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  [(ngModel)]="formData.email" 
                  class="ui-input form-control" 
                  placeholder="ej. usuario@gmail.com" 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Dirección / Referencia Alternativa</label>
              <input 
                type="text" 
                [(ngModel)]="formData.direccion_alternativa" 
                class="ui-input form-control" 
                placeholder="ej. Calle 3 Los Lotes #45, Santa Cruz" 
              />
            </div>

            <!-- Opción para crear usuario al registrar -->
            <div class="user-check-box" *ngIf="!editandoId">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formData.crear_usuario" />
                <span>Habilitar cuenta de acceso con credenciales web y móviles</span>
              </label>

              <div class="form-group mt-2" *ngIf="formData.crear_usuario">
                <label class="form-label">Contraseña inicial (opcional)</label>
                <input 
                  type="password" 
                  [(ngModel)]="formData.password" 
                  class="ui-input form-control" 
                  placeholder="Dejar en blanco para asignar 'password123'" 
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardar()" [disabled]="saving">
              {{ saving ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Registrar Persona') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .personas-page {
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

    .search-stats-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-input-box {
      position: relative;
      flex: 1;
      max-width: 460px;
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

    .stats-pills {
      display: flex;
      gap: 8px;
    }

    .stat-pill {
      font-size: 12.5px;
      color: var(--muted);
      background: var(--surface-alt);
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .ci-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ci-number {
      font-family: monospace;
      font-weight: 700;
      color: var(--ink);
      font-size: 13px;
    }

    .ci-exp {
      font-size: 10px;
      padding: 1px 5px;
    }

    .user-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      font-size: 11.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-fullname {
      font-size: 13px;
      color: var(--ink);
      display: block;
    }

    .alt-address {
      font-size: 11px;
      color: var(--muted);
      display: block;
    }

    .phone-text, .email-text {
      font-size: 12.5px;
      color: #475569;
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
      max-width: 580px;
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

    .user-check-box {
      background: #f8fafc;
      border: 1px solid var(--border);
      padding: 12px 14px;
      border-radius: 10px;
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

    .mt-2 { margin-top: 10px; }

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
export class PersonasComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  personas: Persona[] = [];
  totalPersonas: number = 0;
  loading: boolean = false;
  saving: boolean = false;
  searchQuery: string = '';
  private searchTimeout: any;

  showModal: boolean = false;
  editandoId: number | null = null;
  errorMessage: string = '';

  formData: any = {
    ci: '',
    ci_expedicion: 'SC',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion_alternativa: '',
    crear_usuario: false,
    password: ''
  };

  ngOnInit() {
    this.cargarPersonas();
  }

  cargarPersonas() {
    this.loading = true;
    this.api.getPersonas(1, 50, this.searchQuery).subscribe({
      next: (res) => {
        this.personas = res.items || [];
        this.totalPersonas = res.total || this.personas.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando personas:', err);
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.cargarPersonas();
    }, 300);
  }

  limpiarBusqueda() {
    this.searchQuery = '';
    this.cargarPersonas();
  }

  abrirModalCrear() {
    this.editandoId = null;
    this.errorMessage = '';
    this.formData = {
      ci: '',
      ci_expedicion: 'SC',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion_alternativa: '',
      crear_usuario: false,
      password: ''
    };
    this.showModal = true;
  }

  abrirModalEditar(p: Persona) {
    this.editandoId = p.id;
    this.errorMessage = '';
    this.formData = {
      ci: p.ci,
      ci_expedicion: p.ci_expedicion || 'SC',
      nombres: p.nombres,
      apellidos: p.apellidos,
      email: p.email || '',
      telefono: p.telefono || '',
      direccion_alternativa: p.direccion_alternativa || '',
      crear_usuario: false
    };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.editandoId = null;
    this.errorMessage = '';
  }

  guardar() {
    if (!this.formData.ci || !this.formData.nombres || !this.formData.apellidos) {
      this.errorMessage = 'CI, Nombres y Apellidos son obligatorios.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    if (this.editandoId) {
      this.api.actualizarPersona(this.editandoId, this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.cerrarModal();
          this.cargarPersonas();
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'No se pudo conectar con el backend (http://localhost:3000 está apagado). Por favor inicia el servidor backend.';
          } else {
            this.errorMessage = err.error?.message || 'Error actualizando persona';
          }
          this.saving = false;
        }
      });
    } else {
      this.api.crearPersona(this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.cerrarModal();
          this.cargarPersonas();
        },
        error: (err) => {
          if (err.status === 0) {
            this.errorMessage = 'No se pudo conectar con el backend (http://localhost:3000 está apagado). Por favor inicia el servidor backend.';
          } else {
            this.errorMessage = err.error?.message || 'Error registrando persona';
          }
          this.saving = false;
        }
      });
    }
  }

  async eliminar(p: Persona) {
    const confirmado = await this.confirm.confirm({
      title: '¿Dar de baja a esta persona?',
      message: `Darás de baja del padrón a <strong>${p.nombres} ${p.apellidos}</strong> (CI: ${p.ci}). Esta acción no se puede deshacer.`,
      confirmText: 'Sí, dar de baja',
      cancelText: 'Mantener',
      type: 'danger',
      icon: 'trash'
    });

    if (confirmado) {
      this.api.eliminarPersona(p.id).subscribe({
        next: () => this.cargarPersonas(),
        error: (err) => alert(err.error?.message || 'No se pudo eliminar la persona')
      });
    }
  }

  getInitials(nombres: string, apellidos: string): string {
    const n = nombres ? nombres.trim()[0] : '';
    const a = apellidos ? apellidos.trim()[0] : '';
    return (n + a).toUpperCase();
  }
}
