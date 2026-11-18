export interface Persona {
  id: number;
  ci: string;
  ci_expedicion?: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  direccion_alternativa?: string;
  usuario_id?: number;
  usuario_activo?: boolean;
}

export interface Usuario {
  id: number;
  persona_id: number;
  ci: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
}

export interface Condominio {
  id: number;
  nombre: string;
  nit?: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  fondo_reserva: number;
  dia_limite_pago: number;
  porcentaje_mora_mensual: number;
  rol_id?: string;
  estado?: string;
}

export interface Unidad {
  id: number;
  condominio_id: number;
  codigo: string;
  alicuota: number;
  metros_cuadrados?: number;
  estado: string;
  bloque_nombre?: string;
  piso_nombre?: string;
  tipo_nombre?: string;
  propietarios?: any[];
  residente_actual?: any;
}

export interface Expensa {
  id: number;
  periodo: string;
  unidad_id: number;
  unidad_codigo: string;
  alicuota: number;
  monto_base: number;
  monto_mora: number;
  monto_total: number;
  saldo_pendiente: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: string;
  concepto_nombre?: string;
}

export interface Pago {
  id: number;
  unidad_id: number;
  unidad_codigo: string;
  residente_nombre: string;
  residente_ci: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  referencia_transaccion?: string;
  comprobante_url?: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  motivo_rechazo?: string;
}

export interface DashboardStats {
  periodo: string;
  unidades: {
    total: number;
    ocupadas: number;
    disponibles: number;
  };
  finanzas: {
    total_facturado: number;
    cobrado: number;
    pendiente: number;
    unidades_en_mora: number;
    fondo_reserva: number;
  };
  operaciones: {
    incidencias_pendientes: number;
    reservas_hoy: number;
    visitas_en_curso: number;
  };
}
