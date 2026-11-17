import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Condominios & Dashboard
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/condominios/dashboard`).pipe(map(r => r.data));
  }

  getCondominios(page = 1, limit = 50, search = ''): Observable<any> {
    let url = `${this.baseUrl}/condominios?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url).pipe(map(r => r.data));
  }

  crearCondominio(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/condominios`, data).pipe(map(r => r.data));
  }

  actualizarCondominio(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/condominios/${id}`, data).pipe(map(r => r.data));
  }

  eliminarCondominio(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/condominios/${id}`).pipe(map(r => r.data));
  }

  // Unidades & Asignaciones
  getUnidades(page = 1, limit = 50): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/unidades?page=${page}&limit=${limit}`).pipe(map(r => r.data));
  }

  crearUnidad(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/unidades`, data).pipe(map(r => r.data));
  }

  asignarPropietario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/unidades/asignar-propietario`, data).pipe(map(r => r.data));
  }

  crearContratoResidencia(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/unidades/contrato-residencia`, data).pipe(map(r => r.data));
  }

  // Personas
  getPersonas(search = ''): Observable<any> {
    let url = `${this.baseUrl}/personas`;
    if (search) url += `?search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url).pipe(map(r => r.data));
  }

  buscarPersonaPorCI(ci: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/personas/ci/${ci}`).pipe(map(r => r.data));
  }

  crearPersona(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/personas`, data).pipe(map(r => r.data));
  }

  // Membresías
  getMembresias(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/membresias`).pipe(map(r => r.data));
  }

  getRolesCatalogo(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/membresias/roles`).pipe(map(r => r.data));
  }

  asignarMembresia(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/membresias`, data).pipe(map(r => r.data));
  }

  cambiarEstadoMembresia(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/membresias/${id}/estado`, { estado }).pipe(map(r => r.data));
  }

  // Finanzas
  getExpensas(periodo?: string): Observable<any> {
    let url = `${this.baseUrl}/finanzas/expensas`;
    if (periodo) url += `?periodo=${periodo}`;
    return this.http.get<any>(url).pipe(map(r => r.data));
  }

  generarExpensas(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finanzas/expensas/generar`, payload).pipe(map(r => r.data));
  }

  getEstadoCuenta(unidadId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finanzas/estado-cuenta/${unidadId}`).pipe(map(r => r.data));
  }

  // Pagos
  getPagos(estado?: string): Observable<any> {
    let url = `${this.baseUrl}/pagos`;
    if (estado) url += `?estado=${estado}`;
    return this.http.get<any>(url).pipe(map(r => r.data));
  }

  validarPago(id: number, accion: 'APROBAR' | 'RECHAZAR', motivo?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/pagos/${id}/validar`, { accion, motivo_rechazo: motivo }).pipe(map(r => r.data));
  }

  // Conserjería
  getVisitas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/conserjeria/visitas?activas=true`).pipe(map(r => r.data));
  }

  getPaqueteria(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/conserjeria/paqueteria`).pipe(map(r => r.data));
  }

  validarQR(codigoSeguro: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/conserjeria/qr/validar`, { codigo_seguro: codigoSeguro }).pipe(map(r => r.data));
  }

  // Reservas
  getReservas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservas`).pipe(map(r => r.data));
  }

  getAreasComunes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservas/areas`).pipe(map(r => r.data));
  }

  // Incidencias
  getIncidencias(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/incidencias`).pipe(map(r => r.data));
  }

  actualizarEstadoIncidencia(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/incidencias/${id}/estado`, { estado }).pipe(map(r => r.data));
  }

  // Comunicados
  getComunicados(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/comunicados`).pipe(map(r => r.data));
  }

  publicarComunicado(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/comunicados`, data).pipe(map(r => r.data));
  }
}
