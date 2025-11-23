import { buildApiUrl, apiRequest } from '../config/app-security.js';

export async function getDashboardResumen() {
  const url = buildApiUrl('/dashboard/resumen');
  return await apiRequest(url);
}
