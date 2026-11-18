import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IconComponent } from '../../core/components/icon.component';

@Component({
  selector: 'app-comunicados',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="comunicados-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <div class="tag-row">
            <span class="badge badge-rf">RF-08 Cartelera</span>
            <span class="badge badge-slate">Difusión Digital</span>
          </div>
          <h1 class="page-title">Comunicados Oficiales y Eventos</h1>
          <p class="page-subtitle">
            Circulares, avisos comunitarios, cortes de servicio y citaciones a asamblea general
          </p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalPublicar()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Publicar Comunicado</span>
        </button>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <div class="search-filter-row">
        <div class="search-input-box">
          <div class="search-box-container">
            <app-icon name="search" [size]="16" customClass="search-icon-left"></app-icon>
            <input 
              type="search" 
              [(ngModel)]="searchQuery" 
              placeholder="Buscar comunicados por título, contenido o autor..." 
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
        </div>

        <div class="filter-pills">
          <button 
            class="filter-pill" 
            [class.active]="filtroPrioridad === 'TODOS'" 
            (click)="filtroPrioridad = 'TODOS'">
            Todos ({{ comunicados.length }})
          </button>
          <button 
            class="filter-pill" 
            [class.active]="filtroPrioridad === 'URGENTE'" 
            (click)="filtroPrioridad = 'URGENTE'">
            Urgentes
          </button>
          <button 
            class="filter-pill" 
            [class.active]="filtroPrioridad === 'IMPORTANTE'" 
            (click)="filtroPrioridad = 'IMPORTANTE'">
            Importantes
          </button>
          <button 
            class="filter-pill" 
            [class.active]="filtroPrioridad === 'NORMAL'" 
            (click)="filtroPrioridad = 'NORMAL'">
            Informativos
          </button>
        </div>
      </div>

      <!-- GRID / LISTA DE COMUNICADOS -->
      <div class="comunicados-list">
        <div class="comunicado-card" *ngFor="let c of comunicadosFiltrados">
          <div class="card-top-row">
            <div class="badge-group">
              <span 
                class="badge"
                [class.badge-danger]="c.prioridad === 'URGENTE'"
                [class.badge-warning]="c.prioridad === 'IMPORTANTE'"
                [class.badge-info]="c.prioridad === 'NORMAL'">
                {{ c.prioridad }}
              </span>
              <span class="pub-date">
                {{ c.fecha_publicacion | date:'mediumDate' }} • {{ c.fecha_publicacion | date:'shortTime' }}
              </span>
            </div>

            <button 
              class="btn-archive" 
              (click)="archivar(c)" 
              title="Archivar comunicado de la cartelera">
              <app-icon name="trash" [size]="15"></app-icon>
              <span>Archivar</span>
            </button>
          </div>

          <div class="card-main">
            <h3 class="comunicado-title">{{ c.titulo }}</h3>
            <p class="comunicado-body">{{ c.contenido }}</p>
          </div>

          <div class="card-footer-row">
            <div class="author-meta">
              <div class="avatar-sm">
                {{ c.autor_nombre ? c.autor_nombre[0] : 'A' }}
              </div>
              <span class="author-name">Publicado por {{ c.autor_nombre || 'Administración' }}</span>
            </div>

            <div class="attachment-box" *ngIf="c.adjunto_url">
              <a [href]="c.adjunto_url" target="_blank" class="btn btn-outline btn-sm">
                <app-icon name="pdf" [size]="14"></app-icon>
                <span>Descargar Circular Adjunta</span>
              </a>
            </div>
          </div>
        </div>

        <div class="empty-state-card" *ngIf="comunicadosFiltrados.length === 0">
          <app-icon name="bell" [size]="36" customClass="text-muted"></app-icon>
          <h4>No hay comunicados publicados</h4>
          <p>Los avisos o circulares que publiques aparecerán en la cartelera de todos los residentes.</p>
        </div>
      </div>

      <!-- MODAL PUBLICAR COMUNICADO -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="badge badge-rf">Emisión Comunitaria</span>
              <h3 class="modal-title">Publicar Nuevo Comunicado</h3>
            </div>
            <button class="btn-close" (click)="showModal = false">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>

            <div class="form-group">
              <label class="form-label">Título del Comunicado *</label>
              <input 
                type="text" 
                [(ngModel)]="nuevoComunicado.titulo" 
                placeholder="ej. Mantenimiento Preventivo de Bomba de Agua" 
                class="ui-input form-control" 
              />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nivel de Prioridad *</label>
                <select [(ngModel)]="nuevoComunicado.prioridad" class="ui-select form-control">
                  <option value="NORMAL">Informativo (Normal)</option>
                  <option value="IMPORTANTE">Importante (Novedad)</option>
                  <option value="URGENTE">Urgente (Cortes / Alerta)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Fecha de Expiración (opcional)</label>
                <input type="date" [(ngModel)]="nuevoComunicado.fecha_expiracion" class="ui-input form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Mensaje o Detalle Completo *</label>
              <textarea 
                [(ngModel)]="nuevoComunicado.contenido" 
                placeholder="Escribe el mensaje que recibirán los copropietarios e inquilinos en su panel y notificación móvil..." 
                class="ui-input form-control" 
                rows="5">
              </textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showModal = false">Cancelar</button>
            <button class="btn btn-primary" (click)="publicar()" [disabled]="saving">
              {{ saving ? 'Transmitiendo...' : 'Publicar en Cartelera' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comunicados-page {
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

    .search-filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-input-box {
      flex: 1;
      max-width: 440px;
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

    .comunicados-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .comunicado-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 22px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: var(--card-shadow);
      transition: box-shadow 0.2s ease;
    }

    .comunicado-card:hover {
      box-shadow: var(--soft-shadow);
    }

    .card-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .badge-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pub-date {
      font-size: 12px;
      color: var(--muted);
    }

    .btn-archive {
      background: none;
      border: 1px solid transparent;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.15s ease;
    }

    .btn-archive:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fecaca;
    }

    .card-main {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .comunicado-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--ink);
      line-height: 1.3;
    }

    .comunicado-body {
      font-size: 13.5px;
      color: #334155;
      line-height: 1.6;
      white-space: pre-line;
    }

    .card-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f8fafc;
      padding-top: 12px;
      margin-top: 4px;
    }

    .author-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar-sm {
      width: 26px;
      height: 26px;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .author-name {
      font-size: 12px;
      color: var(--muted);
      font-weight: 500;
    }

    .empty-state-card {
      background: #ffffff;
      border: 1px dashed var(--border);
      border-radius: 16px;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 10px;
    }

    .empty-state-card h4 {
      font-size: 16px;
      color: var(--ink);
      font-weight: 700;
      margin: 0;
    }

    .empty-state-card p {
      font-size: 13px;
      color: var(--muted);
      max-width: 380px;
      margin: 0;
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
      max-width: 540px;
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
export class ComunicadosComponent implements OnInit {
  private api = inject(ApiService);
  private confirm = inject(ConfirmService);

  comunicados: any[] = [];
  searchQuery: string = '';
  filtroPrioridad: string = 'TODOS';
  saving: boolean = false;
  showModal: boolean = false;
  errorMessage: string = '';

  nuevoComunicado = {
    titulo: '',
    contenido: '',
    prioridad: 'NORMAL',
    fecha_expiracion: ''
  };

  get comunicadosFiltrados(): any[] {
    let list = this.comunicados;
    if (this.filtroPrioridad !== 'TODOS') {
      list = list.filter(c => c.prioridad === this.filtroPrioridad);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => 
        c.titulo?.toLowerCase().includes(q) ||
        c.contenido?.toLowerCase().includes(q) ||
        c.autor_nombre?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  ngOnInit() {
    this.cargarComunicados();
  }

  cargarComunicados() {
    this.api.getComunicados().subscribe({
      next: (data) => this.comunicados = Array.isArray(data) ? data : (data?.items || []),
      error: (err) => console.error('Error al cargar comunicados:', err)
    });
  }

  abrirModalPublicar() {
    this.errorMessage = '';
    this.nuevoComunicado = {
      titulo: '',
      contenido: '',
      prioridad: 'NORMAL',
      fecha_expiracion: ''
    };
    this.showModal = true;
  }

  publicar() {
    if (!this.nuevoComunicado.titulo || !this.nuevoComunicado.contenido) {
      this.errorMessage = 'El título y el mensaje son obligatorios.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.api.publicarComunicado(this.nuevoComunicado).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.cargarComunicados();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Error al publicar comunicado';
      }
    });
  }

  async archivar(comunicado: any) {
    const confirmado = await this.confirm.confirm({
      title: '¿Archivar comunicado?',
      message: `Retirarás el comunicado <strong>"${comunicado.titulo}"</strong> de la cartelera digital. Los residentes ya no lo verán en su panel.`,
      confirmText: 'Sí, archivar',
      cancelText: 'Mantener',
      type: 'warning',
      icon: 'trash'
    });

    if (confirmado) {
      this.api.eliminarComunicado(comunicado.id).subscribe({
        next: () => this.cargarComunicados(),
        error: (err) => alert(err.error?.message || 'No se pudo archivar el comunicado.')
      });
    }
  }
}
