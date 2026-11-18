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
  getUnidades(page = 1, limit = 50, search = ''): Observable<any> {
    let url = `${this.baseUrl}/unidades?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url).pipe(map(r => r.data));
  }

  crearUnidad(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/unidades`, data).pipe(map(r => r.data));
  }

  actualizarUnidad(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/unidades/${id}`, data).pipe(map(r => r.data));
  }

  eliminarUnidad(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/unidades/${id}`).pipe(map(r => r.data));
  }

  getTiposUnidad(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/unidades/tipos`).pipe(map(r => r.data));
  }

  getBloques(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/unidades/bloques`).pipe(map(r => r.data));
  }

  asignarPropietario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/unidades/asignar-propietario`, data).pipe(map(r => r.data));
  }

  crearContratoResidencia(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/unidades/contrato-residencia`, data).pipe(map(r => r.data));
  }

  // Personas
  getPersonas(page = 1, limit = 50, search = ''): Observable<any> {
    let url = `${this.baseUrl}/personas?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url).pipe(map(r => r.data));
  }

  buscarPersonaPorCI(ci: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/personas/ci/${ci}`).pipe(map(r => r.data));
  }

  crearPersona(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/personas`, data).pipe(map(r => r.data));
  }

  actualizarPersona(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/personas/${id}`, data).pipe(map(r => r.data));
  }

  eliminarPersona(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/personas/${id}`).pipe(map(r => r.data));
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

  getTodasVisitas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/conserjeria/visitas`).pipe(map(r => r.data));
  }

  registrarVisita(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/conserjeria/visitas`, data).pipe(map(r => r.data));
  }

  registrarSalidaVisita(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/conserjeria/visitas/${id}/salida`, {}).pipe(map(r => r.data));
  }

  eliminarVisita(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/conserjeria/visitas/${id}`).pipe(map(r => r.data));
  }

  getPaqueteria(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/conserjeria/paqueteria`).pipe(map(r => r.data));
  }

  registrarPaquete(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/conserjeria/paqueteria`, data).pipe(map(r => r.data));
  }

  entregarPaquete(id: number, entregadoA: string = 'Destinatario'): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/conserjeria/paqueteria/${id}/entregar`, { entregado_a: entregadoA }).pipe(map(r => r.data));
  }

  eliminarPaquete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/conserjeria/paqueteria/${id}`).pipe(map(r => r.data));
  }

  validarQR(codigoSeguro: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/conserjeria/qr/validar`, { codigo_seguro: codigoSeguro }).pipe(map(r => r.data));
  }

  // Reservas & Áreas Comunes
  getReservas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservas`).pipe(map(r => r.data));
  }

  crearReserva(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reservas`, data).pipe(map(r => r.data));
  }

  cancelarReserva(id: number, motivo: string = 'Cancelado por administración'): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/reservas/${id}/cancelar`, { motivo }).pipe(map(r => r.data));
  }

  getAreasComunes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservas/areas`).pipe(map(r => r.data));
  }

  crearAreaComun(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reservas/areas`, data).pipe(map(r => r.data));
  }

  eliminarAreaComun(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/reservas/areas/${id}`).pipe(map(r => r.data));
  }

  // Incidencias
  getIncidencias(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/incidencias`).pipe(map(r => r.data));
  }

  getIncidenciaDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/incidencias/${id}`).pipe(map(r => r.data));
  }

  crearIncidencia(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/incidencias`, data).pipe(map(r => r.data));
  }

  actualizarEstadoIncidencia(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/incidencias/${id}/estado`, { estado }).pipe(map(r => r.data));
  }

  eliminarIncidencia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/incidencias/${id}`).pipe(map(r => r.data));
  }

  agregarComentarioIncidencia(id: number, comentario: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/incidencias/${id}/comentarios`, { comentario }).pipe(map(r => r.data));
  }

  // Comunicados y Eventos
  getComunicados(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/comunicados`).pipe(map(r => r.data));
  }

  publicarComunicado(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/comunicados`, data).pipe(map(r => r.data));
  }

  eliminarComunicado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/comunicados/${id}`).pipe(map(r => r.data));
  }

  // Generación Expensas
  generarExpensasMasivas(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finanzas/expensas/generar`, data).pipe(map(r => r.data));
  }

  // Gobernanza y Asambleas (Encuestas)
  getEncuestas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/encuestas`).pipe(map(r => r.data));
  }

  crearEncuesta(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/encuestas`, data).pipe(map(r => r.data));
  }

  votarEncuesta(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/encuestas/votar`, data).pipe(map(r => r.data));
  }

  cerrarEncuesta(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/encuestas/${id}/cerrar`, {}).pipe(map(r => r.data));
  }

  eliminarEncuesta(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/encuestas/${id}`).pipe(map(r => r.data));
  }
}
