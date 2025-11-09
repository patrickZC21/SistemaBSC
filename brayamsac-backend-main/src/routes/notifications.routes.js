import { Router } from 'express';
import jwt from 'jsonwebtoken';
import notificationService from '../services/notification.service.js';

const router = Router();

// Endpoint para Server-Sent Events de asistencias (sin middleware verificarToken para SSE)
router.get('/events', (req, res) => {
  // Verificar token manualmente para SSE
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secreto-super-seguro');
    notificationService.addClient(res);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// 📊 Endpoint para Server-Sent Events del Dashboard (tiempo real)
router.get('/dashboard', (req, res) => {
  // Verificar token manualmente para SSE
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secreto-super-seguro');
    notificationService.addDashboardClient(res);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
