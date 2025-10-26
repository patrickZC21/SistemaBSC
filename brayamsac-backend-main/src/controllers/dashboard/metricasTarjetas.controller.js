import { obtenerMetricasTarjetas as obtenerMetricasService } from '../../services/dashboard/metricasTarjetas.service.js';

export const obtenerMetricasTarjetas = async (req, res) => {
  try {
    const metricas = await obtenerMetricasService();
    res.json(metricas);
  } catch (error) {
    console.error('Error al obtener métricas de tarjetas:', error);
    res.status(500).json({ error: 'Error al obtener métricas del dashboard' });
  }
};
