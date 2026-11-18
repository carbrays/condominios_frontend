import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmOptions } from '../services/confirm.service';
import { IconComponent } from './icon.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="confirm-backdrop" *ngIf="state" (click)="onBackdropClick($event)">
      <div class="confirm-card" role="dialog" aria-modal="true">
        <!-- ÍCONO SUPERIOR DESTACADO -->
        <div class="icon-circle" [ngClass]="state.options.type || 'danger'">
          <app-icon [name]="state.options.icon || 'trash'" [size]="24" [strokeWidth]="2.2"></app-icon>
        </div>

        <!-- TÍTULO -->
        <h2 class="confirm-title">{{ state.options.title }}</h2>

        <!-- MENSAJE CON SOPORTE HTML -->
        <p class="confirm-message" [innerHTML]="state.options.message"></p>

        <!-- ACCIONES (BOTONES) -->
        <div class="confirm-actions">
          <button 
            type="button" 
            class="btn-cancel" 
            (click)="cancel()">
            {{ state.options.cancelText || 'Mantener' }}
          </button>
          <button 
            type="button" 
            class="btn-confirm" 
            [ngClass]="state.options.type || 'danger'"
            (click)="confirm()">
            {{ state.options.confirmText || 'Sí, continuar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.15s ease-out;
    }

    .confirm-card {
      background: #ffffff;
      border-radius: 22px;
      width: 100%;
      max-width: 440px;
      padding: 34px 30px 28px;
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.6);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(6px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* ÍCONO CIRCULAR SUPERIOR */
    .icon-circle {
      width: 58px;
      height: 58px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .icon-circle.danger {
      background: #ffe4e6;
      color: #b91c1c;
    }

    .icon-circle.warning {
      background: #fef3c7;
      color: #b45309;
    }

    .icon-circle.info {
      background: #e0f2fe;
      color: #0369a1;
    }

    /* TÍTULO */
    .confirm-title {
      font-family: var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 10px;
      line-height: 1.3;
    }

    /* MENSAJE */
    .confirm-message {
      font-family: var(--font-body, 'Inter', system-ui, sans-serif);
      font-size: 13.5px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 24px;
      max-width: 360px;
    }

    .confirm-message strong {
      color: #0f172a;
      font-weight: 600;
    }

    /* BOTONES */
    .confirm-actions {
      display: flex;
      gap: 12px;
      width: 100%;
    }

    .btn-cancel {
      flex: 1;
      height: 44px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      background: #eef2ff;
      color: #1e293b;
      border: 1px solid #e0e7ff;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
    }

    .btn-cancel:hover {
      background: #e0e7ff;
      color: #0f172a;
    }

    .btn-cancel:active {
      transform: scale(0.98);
    }

    .btn-confirm {
      flex: 1;
      height: 44px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
    }

    .btn-confirm.danger {
      background: #b91c1c;
      box-shadow: 0 4px 12px rgba(185, 28, 28, 0.25);
    }

    .btn-confirm.danger:hover {
      background: #991b1b;
      box-shadow: 0 6px 16px rgba(185, 28, 28, 0.35);
    }

    .btn-confirm.warning {
      background: #d97706;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
    }

    .btn-confirm.warning:hover {
      background: #b45309;
    }

    .btn-confirm:active {
      transform: scale(0.98);
    }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  private confirmService = inject(ConfirmService);
  state: { options: ConfirmOptions; resolve: (v: boolean) => void } | null = null;
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.confirmService.confirmState$.subscribe((state) => {
      this.state = state;
    });
  }

  confirm() {
    if (this.state) {
      this.state.resolve(true);
      this.state = null;
    }
  }

  cancel() {
    if (this.state) {
      this.state.resolve(false);
      this.state = null;
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
      this.cancel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.state) {
      this.cancel();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
