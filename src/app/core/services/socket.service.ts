import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:3000';

  constructor(
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  connect() {
    const token = this.authService.getToken();
    if (!token) return;

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(this.serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 5000,
      autoConnect: true
    });

    this.socket.on('connect_error', (err) => {
      // Evitar spam en consola si el backend está apagado
    });

    this.socket.on('connect', () => {
      console.log('[SOCKET ANGULAR] Conectado exitosamente');
    });

    this.socket.on('disconnect', () => {
      console.log('[SOCKET ANGULAR] Desconectado');
    });
  }

  fromEvent<T>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      if (!this.socket) {
        this.connect();
      }
      this.socket?.on(eventName, (data: T) => {
        this.ngZone.run(() => {
          observer.next(data);
        });
      });
      return () => {
        this.socket?.off(eventName);
      };
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
