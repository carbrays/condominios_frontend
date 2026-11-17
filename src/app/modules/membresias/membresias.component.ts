import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Membresías y Roles del Condominio</h1>
          <p class="subtitle">Asigna administradores, conserjes, porteros e inquilinos a este condominio</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          ➕ Asignar Nueva Membresía
        </button>
      </div>

      <!-- TABLA DE MEMBRESÍAS -->
      <div class="card table-card">
        <div *ngIf="loading" class="loading-state">Cargando membresías...</div>

        <table *ngIf="!loading" class="data-table">
          <thead>
            <tr>
              <th>Usuario / Persona</th>
              <th>CI</th>
              <th>Email / Teléfono</th>
              <th>Rol en Condominio</th>
              <th>Fecha Inicio</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of membresias">
              <td>
                <div class="user-name">{{ m.nombres }} {{ m.apellidos }}</div>
                <small class="user-sub">Usuario #{{ m.usuario_id }}</small>
              </td>
              <td><strong>{{ m.ci }}</strong> {{ m.ci_expedicion || '' }}</td>
              <td>
                <div>{{ m.email || '—' }}</div>
                <small class="text-muted">{{ m.telefono || '' }}</small>
              </td>
              <td>
                <span class="role-pill role-{{ m.rol_id }}">
                  {{ m.rol_id }}
                </span>
              </td>
              <td>{{ m.fecha_inicio | date:'dd/MM/yyyy' }}</td>
              <td>
                <span class="badge" [class.badge-active]="m.estado === 'ACTIVO'" [class.badge-inactive]="m.estado !== 'ACTIVO'">
                  {{ m.estado }}
                </span>
              </td>
              <td>
                <button 
                  class="btn-sm" 
                  [ngClass]="m.estado === 'ACTIVO' ? 'btn-danger-outline' : 'btn-success-outline'"
                  (click)="toggleEstado(m)">
                  {{ m.estado === 'ACTIVO' ? 'Suspender' : 'Activar' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="membresias.length === 0">
              <td colspan="7" class="empty-state">No hay miembros registrados en este condominio.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL ASIGNAR MEMBRESÍA -->
      <div *ngIf="showModal" class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Asignar Persona a este Condominio</h3>
            <button class="btn-close" (click)="showModal = false">✖</button>
          </div>
          <form (ngSubmit)="guardarMembresia()">
            <div class="modal-body">
              <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
              <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>

              <!-- PASO 1: BUSCAR POR CI -->
              <div class="form-group">
                <label>Buscar Persona por Cédula de Identidad (CI) *</label>
                <div class="input-with-button">
                  <input type="text" [(ngModel)]="ciBusqueda" name="ciBusqueda" class="form-control" placeholder="Ej. 3000003" required />
                  <button type="button" class="btn btn-secondary" (click)="buscarPorCI()" [disabled]="buscando">
                    {{ buscando ? 'Buscando...' : '🔍 Buscar' }}
                  </button>
                </div>
              </div>

              <!-- DATOS DE LA PERSONA ENCONTRADA -->
              <div *ngIf="personaEncontrada" class="persona-card">
                <div class="persona-header">
                  ✅ <strong>{{ personaEncontrada.nombres }} {{ personaEncontrada.apellidos }}</strong>
                </div>
                <div class="persona-details">
                  <span>CI: {{ personaEncontrada.ci }}</span> | 
                  <span>Email: {{ personaEncontrada.email || 'Sin email' }}</span>
                </div>
              </div>

              <!-- SI NO EXISTE: FORMULARIO RÁPIDO PARA REGISTRARLA -->
              <div *ngIf="mostrarRegistroPersona" class="registro-rapido">
                <h4>Persona no encontrada. Registrar nueva:</h4>
                <div class="form-row">
                  <div class="form-group col">
                    <label>Nombres *</label>
                    <input type="text" [(ngModel)]="nuevaPersona.nombres" name="nombres" class="form-control" required />
                  </div>
                  <div class="form-group col">
                    <label>Apellidos *</label>
                    <input type="text" [(ngModel)]="nuevaPersona.apellidos" name="apellidos" class="form-control" required />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col">
                    <label>Teléfono</label>
                    <input type="text" [(ngModel)]="nuevaPersona.telefono" name="telefono" class="form-control" />
                  </div>
                  <div class="form-group col">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="nuevaPersona.email" name="email" class="form-control" />
                  </div>
                </div>
                <button type="button" class="btn btn-sm btn-primary" (click)="crearYSeleccionarPersona()">
                  Guardar y Seleccionar
                </button>
              </div>

              <!-- PASO 2: SELECCIONAR ROL -->
              <div class="form-group" style="margin-top: 16px;">
                <label>Rol que desempeñará en este Condominio *</label>
                <select [(ngModel)]="selectedRol" name="selectedRol" class="form-control" required>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Gestiona el condominio)</option>
                  <option value="CONSERJE">CONSERJE / PORTERO (Portería, visitas, paquetería)</option>
                  <option value="DIRECTORIO">DIRECTORIO (Mesa directiva)</option>
                  <option value="COPROPIETARIO">COPROPIETARIO (Dueño de unidades)</option>
                  <option value="INQUILINO">INQUILINO (Residente arrendatario)</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving || !personaEncontrada">
                {{ saving ? 'Asignando...' : 'Asignar al Condominio' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; color: #0f172a; margin: 0 0 4px 0; font-weight: 700; }
    .subtitle { color: #64748B; margin: 0; font-size: 14px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 14px 16px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .user-name { font-weight: 600; color: #0f172a; }
    .user-sub { color: #94a3b8; font-size: 12px; }
    .text-muted { color: #94a3b8; font-size: 12px; }
    .role-pill { padding: 4px 10px; border-radius: 14px; font-size: 11px; font-weight: 700; display: inline-block; }
    .role-ADMINISTRADOR { background: #ede9fe; color: #6d28d9; }
    .role-CONSERJE { background: #e0f2fe; color: #0369a1; }
    .role-DIRECTORIO { background: #fef3c7; color: #b45309; }
    .role-COPROPIETARIO { background: #dcfce7; color: #15803d; }
    .role-INQUILINO { background: #f1f5f9; color: #475569; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-inactive { background: #fee2e2; color: #b91c1c; }
    .btn { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; }
    .btn-primary { background: #1e3a8a; color: white; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .btn-sm { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-danger-outline { background: white; color: #dc2626; border: 1px solid #fecaca; }
    .btn-danger-outline:hover { background: #fee2e2; }
    .btn-success-outline { background: white; color: #15803d; border: 1px solid #bbf7d0; }
    .btn-success-outline:hover { background: #dcfce7; }
    .form-control { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #334155; }
    .input-with-button { display: flex; gap: 8px; }
    .input-with-button input { flex: 1; }
    .form-row { display: flex; gap: 12px; }
    .col { flex: 1; }
    .persona-card { padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 14px; }
    .persona-header { color: #166534; font-size: 14px; margin-bottom: 4px; }
    .persona-details { font-size: 12px; color: #15803d; }
    .registro-rapido { padding: 14px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; margin-bottom: 14px; }
    .registro-rapido h4 { margin: 0 0 10px 0; font-size: 13px; color: #92400e; }
    .loading-state, .empty-state { padding: 32px; text-align: center; color: #64748B; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; width: 90%; max-width: 520px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #0f172a; }
    .btn-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 20px; max-height: 75vh; overflow-y: auto; }
    .modal-footer { padding: 14px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }
    .alert-error { padding: 10px 14px; background: #fee2e2; color: #991b1b; border-radius: 8px; margin-bottom: 14px; font-size: 13px; }
    .alert-success { padding: 10px 14px; background: #dcfce7; color: #166534; border-radius: 8px; margin-bottom: 14px; font-size: 13px; }
  `]
})
export class MembresiasComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  membresias: any[] = [];
  loading = false;
  showModal = false;
  saving = false;
  buscando = false;
  errorMsg = '';
  successMsg = '';

  ciBusqueda = '';
  personaEncontrada: any = null;
  mostrarRegistroPersona = false;
  selectedRol = 'CONSERJE';

  nuevaPersona = {
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    email: ''
  };

  ngOnInit() {
    this.cargarMembresias();
  }

  cargarMembresias() {
    this.loading = true;
    this.api.getMembresias().subscribe({
      next: (res) => {
        this.membresias = Array.isArray(res) ? res : (res?.items || []);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openModal() {
    this.errorMsg = '';
    this.successMsg = '';
    this.ciBusqueda = '';
    this.personaEncontrada = null;
    this.mostrarRegistroPersona = false;
    this.selectedRol = 'CONSERJE';
    this.showModal = true;
  }

  buscarPorCI() {
    if (!this.ciBusqueda.trim()) return;
    this.buscando = true;
    this.errorMsg = '';
    this.mostrarRegistroPersona = false;
    this.personaEncontrada = null;

    this.api.buscarPersonaPorCI(this.ciBusqueda.trim()).subscribe({
      next: (res) => {
        this.personaEncontrada = res;
        this.buscando = false;
      },
      error: () => {
        this.buscando = false;
        this.mostrarRegistroPersona = true;
        this.nuevaPersona.ci = this.ciBusqueda.trim();
      }
    });
  }

  crearYSeleccionarPersona() {
    if (!this.nuevaPersona.nombres || !this.nuevaPersona.apellidos) {
      this.errorMsg = 'Nombres y apellidos son requeridos';
      return;
    }

    this.api.crearPersona(this.nuevaPersona).subscribe({
      next: (res) => {
        this.personaEncontrada = res;
        this.mostrarRegistroPersona = false;
        this.errorMsg = '';
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error al registrar persona';
      }
    });
  }

  guardarMembresia() {
    if (!this.personaEncontrada) {
      this.errorMsg = 'Debes buscar o registrar una persona primero';
      return;
    }

    this.saving = true;
    this.errorMsg = '';

    // Asignar membresía: usuario_id es personaEncontrada.usuario_id o personaEncontrada.id
    const payload = {
      usuario_id: this.personaEncontrada.usuario_id || this.personaEncontrada.id,
      rol_id: this.selectedRol
    };

    this.api.asignarMembresia(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.cargarMembresias();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error al asignar la membresía';
        this.saving = false;
      }
    });
  }

  toggleEstado(m: any) {
    const nuevoEstado = m.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    this.api.cambiarEstadoMembresia(m.id, nuevoEstado).subscribe({
      next: () => this.cargarMembresias(),
      error: (err) => alert(err?.error?.message || 'Error al cambiar estado')
    });
  }
}
