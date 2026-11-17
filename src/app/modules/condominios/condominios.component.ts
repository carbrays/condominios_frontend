import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-condominios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestión de Condominios</h1>
          <p class="subtitle">Administración global multi-tenant de condominios y edificios</p>
        </div>
        <button *ngIf="canCreate" class="btn btn-primary" (click)="openCreateModal()">
          ➕ Nuevo Condominio
        </button>
      </div>

      <!-- BUSCADOR -->
      <div class="search-bar">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (input)="onSearch()" 
          placeholder="Buscar por nombre, NIT o ciudad..." 
          class="form-control"
        />
      </div>

      <!-- TABLA DE CONDOMINIOS -->
      <div class="card table-card">
        <div *ngIf="loading" class="loading-state">Cargando condominios...</div>
        
        <table *ngIf="!loading" class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>NIT</th>
              <th>Ciudad / Dirección</th>
              <th>Teléfono / Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of condominios">
              <td><strong>#{{ c.id }}</strong></td>
              <td>
                <div class="condo-name">{{ c.nombre }}</div>
                <small class="condo-desc">{{ c.direccion || 'Sin dirección registrada' }}</small>
              </td>
              <td>{{ c.nit || '—' }}</td>
              <td>{{ c.ciudad || '—' }}</td>
              <td>
                <div>{{ c.telefono || '—' }}</div>
                <small class="text-muted">{{ c.email || '' }}</small>
              </td>
              <td>
                <span class="badge" [class.badge-active]="c.estado === 'ACTIVO'" [class.badge-inactive]="c.estado !== 'ACTIVO'">
                  {{ c.estado }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button *ngIf="canEdit" class="btn-sm btn-outline" (click)="openEditModal(c)" title="Editar">✏️</button>
                  <button *ngIf="canEdit" class="btn-sm btn-danger-outline" (click)="eliminar(c)" title="Desactivar">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="condominios.length === 0">
              <td colspan="7" class="empty-state">No se encontraron condominios registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL CREAR / EDITAR -->
      <div *ngIf="showModal" class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Editar Condominio' : 'Nuevo Condominio' }}</h3>
            <button class="btn-close" (click)="closeModal()">✖</button>
          </div>
          <form (ngSubmit)="guardar()">
            <div class="modal-body">
              <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>

              <div class="form-group">
                <label>Nombre del Condominio / Edificio *</label>
                <input type="text" [(ngModel)]="currentCondo.nombre" name="nombre" class="form-control" required />
              </div>

              <div class="form-row">
                <div class="form-group col">
                  <label>NIT / Identificación Fiscal</label>
                  <input type="text" [(ngModel)]="currentCondo.nit" name="nit" class="form-control" />
                </div>
                <div class="form-group col">
                  <label>Ciudad</label>
                  <input type="text" [(ngModel)]="currentCondo.ciudad" name="ciudad" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label>Dirección</label>
                <input type="text" [(ngModel)]="currentCondo.direccion" name="direccion" class="form-control" />
              </div>

              <div class="form-row">
                <div class="form-group col">
                  <label>Teléfono de Contacto</label>
                  <input type="text" [(ngModel)]="currentCondo.telefono" name="telefono" class="form-control" />
                </div>
                <div class="form-group col">
                  <label>Email de Administración</label>
                  <input type="email" [(ngModel)]="currentCondo.email" name="email" class="form-control" />
                </div>
              </div>

              <div class="form-group" *ngIf="isEditing">
                <label>Estado</label>
                <select [(ngModel)]="currentCondo.estado" name="estado" class="form-control">
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                  <option value="SUSPENDIDO">SUSPENDIDO</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Condominio') }}
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
    .search-bar { margin-bottom: 16px; }
    .search-bar input { max-width: 400px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; padding: 14px 16px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .condo-name { font-weight: 600; color: #0f172a; }
    .condo-desc { color: #64748B; display: block; font-size: 12px; margin-top: 2px; }
    .text-muted { color: #94a3b8; font-size: 12px; }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }
    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-inactive { background: #fee2e2; color: #b91c1c; }
    .action-buttons { display: flex; gap: 8px; }
    .btn { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 14px; }
    .btn-primary { background: #1e3a8a; color: white; }
    .btn-primary:hover { background: #1e40af; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-sm { padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }
    .btn-outline:hover { background: #f8fafc; }
    .btn-danger-outline { color: #dc2626; border-color: #fecaca; }
    .btn-danger-outline:hover { background: #fee2e2; }
    .form-control { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-control:focus { outline: none; border-color: #1e3a8a; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #334155; }
    .form-row { display: flex; gap: 16px; }
    .col { flex: 1; }
    .loading-state, .empty-state { padding: 32px; text-align: center; color: #64748B; }
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; width: 90%; max-width: 550px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #0f172a; }
    .btn-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 20px; max-height: 75vh; overflow-y: auto; }
    .modal-footer { padding: 14px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }
    .alert-error { padding: 10px 14px; background: #fee2e2; color: #991b1b; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
  `]
})
export class CondominiosComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  condominios: any[] = [];
  loading = false;
  searchQuery = '';
  showModal = false;
  isEditing = false;
  saving = false;
  errorMsg = '';

  currentCondo: any = {
    nombre: '',
    nit: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    estado: 'ACTIVO'
  };

  get canCreate(): boolean {
    return this.auth.hasPermission('CONDOMINIO_CREAR') || this.auth.activeCondominio()?.rol_id === 'SUPER_ADMIN';
  }

  get canEdit(): boolean {
    return this.auth.hasPermission('CONDOMINIO_EDITAR') || this.auth.activeCondominio()?.rol_id === 'SUPER_ADMIN';
  }

  ngOnInit() {
    this.cargarCondominios();
  }

  cargarCondominios() {
    this.loading = true;
    this.api.getCondominios(1, 100, this.searchQuery).subscribe({
      next: (res) => {
        this.condominios = Array.isArray(res) ? res : (res?.items || []);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.cargarCondominios();
  }

  openCreateModal() {
    this.isEditing = false;
    this.errorMsg = '';
    this.currentCondo = {
      nombre: '',
      nit: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      estado: 'ACTIVO'
    };
    this.showModal = true;
  }

  openEditModal(condo: any) {
    this.isEditing = true;
    this.errorMsg = '';
    this.currentCondo = { ...condo };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  guardar() {
    if (!this.currentCondo.nombre || !this.currentCondo.nombre.trim()) {
      this.errorMsg = 'El nombre del condominio es obligatorio';
      return;
    }

    this.saving = true;
    this.errorMsg = '';

    const req$ = this.isEditing
      ? this.api.actualizarCondominio(this.currentCondo.id, this.currentCondo)
      : this.api.crearCondominio(this.currentCondo);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.cargarCondominios();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error al guardar el condominio';
        this.saving = false;
      }
    });
  }

  eliminar(condo: any) {
    if (confirm(`¿Estás seguro de que deseas desactivar/eliminar el condominio "${condo.nombre}"?`)) {
      this.api.eliminarCondominio(condo.id).subscribe({
        next: () => this.cargarCondominios(),
        error: (err) => alert(err?.error?.message || 'Error al eliminar')
      });
    }
  }
}
