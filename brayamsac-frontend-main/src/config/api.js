/**
 * Configuración de la API
 */

// Configuración centralizada de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Configuración de timeouts
export const API_TIMEOUT = 10000; // 10 segundos

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Endpoints comunes
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  ASISTENCIAS: '/api/asistencias',
  ALMACENES: '/api/almacenes',
  SUBALMACENES: '/api/subalmacenes',
  TRABAJADORES: '/api/trabajadores',
  USUARIOS: '/api/usuarios',
  ROTACIONES: '/api/rotaciones',
  DASHBOARD: '/api/dashboard',
  USUARIO_ALMACENES: '/api/usuario-almacenes',
  TRABAJADOR_ASISTENCIA: '/api/trabajadorAsistencia',
  NOTIFICATIONS: '/api/notifications/events',
};

export function buildApiUrl(endpoint) {
  // Si el endpoint ya contiene la URL base, no la duplica
  if (endpoint.startsWith('http')) return endpoint;
  
  // Siempre usar la URL completa del backend para evitar errores de CORS
  return `${API_BASE_URL}${endpoint}`;
}

export default {
  API_BASE_URL,
  API_TIMEOUT,
  DEFAULT_HEADERS,
  API_ENDPOINTS,
};
