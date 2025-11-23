import { buildApiUrl, tokenManager, apiRequest } from '../config/app-security.js';

// Servicio para consumir la API de subalmacenes
export async function getSubalmacenes(token) {
  const url = buildApiUrl("/api/subalmacenes");
  return await apiRequest(url);
}

// Listar subalmacenes por almacen_id
export async function getSubalmacenesByAlmacen(almacenId, token) {
  const url = buildApiUrl("/api/subalmacenes", { almacen_id: almacenId });
  return await apiRequest(url);
}

// Servicio para consumir la API de subalmacenes asignados a un usuario en un almacén específico
export async function getSubalmacenesAsignadosByAlmacen(almacenId, token) {
  const url = buildApiUrl(`/api/subalmacenes/asignados/${almacenId}`);
  return await apiRequest(url);
}
