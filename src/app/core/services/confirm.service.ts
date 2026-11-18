import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private confirmSubject = new Subject<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>();

  confirmState$ = this.confirmSubject.asObservable();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirmSubject.next({
        options: {
          confirmText: options.confirmText || 'Sí, continuar',
          cancelText: options.cancelText || 'Mantener',
          type: options.type || 'danger',
          icon: options.icon || (options.type === 'warning' ? 'alert-triangle' : 'trash'),
          ...options
        },
        resolve
      });
    });
  }

  close() {
    this.confirmSubject.next(null);
  }
}
