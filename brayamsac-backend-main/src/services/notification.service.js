// Servicio para notificar cambios en tiempo real
import { EventEmitter } from 'events';

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
    this.dashboardClients = new Set();
  }

  // Agregar un cliente SSE (asistencias)
  addClient(res) {
    this.clients.add(res);
    console.log(`📡 Cliente SSE (asistencias) agregado. Total: ${this.clients.size}`);
    
    // Configurar conexión SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',      // ← evita que nginx corte la conexión SSE
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    res.flushHeaders(); // ← envía headers inmediatamente

    // Enviar mensaje inicial
    res.write('data: {"type": "connected"}\n\n');

    // Limpiar cliente cuando se desconecta
    res.on('close', () => {
      this.clients.delete(res);
      console.log(`📡 Cliente SSE (asistencias) desconectado. Total: ${this.clients.size}`);
    });
  }

  // Agregar un cliente SSE para el dashboard
  addDashboardClient(res) {
    this.dashboardClients.add(res);
    console.log(`📊 Cliente SSE (dashboard) agregado. Total: ${this.dashboardClients.size}`);
    
    // Configurar conexión SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',      // ← evita que nginx corte la conexión SSE
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    res.flushHeaders(); // ← envía headers inmediatamente sin esperar el body

    // Enviar mensaje inicial con timestamp
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Heartbeat cada 25 segundos para mantener la conexión viva
    const heartbeat = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
      } catch (error) {
        clearInterval(heartbeat);
        this.dashboardClients.delete(res);
      }
    }, 25000);

    // Limpiar cliente cuando se desconecta
    res.on('close', () => {
      clearInterval(heartbeat);
      this.dashboardClients.delete(res);
      console.log(`📊 Cliente SSE (dashboard) desconectado. Total: ${this.dashboardClients.size}`);
    });
  }

  // Notificar cambio en asistencias
  notifyAsistenciaChange(subalmacenId, fecha, action = 'update') {
    const message = {
      type: 'asistencia_change',
      subalmacen_id: subalmacenId,
      fecha: fecha,
      action: action,
      timestamp: new Date().toISOString()
    };

    console.log('📡 Notificando cambio en asistencias:', message);

    // Enviar a todos los clientes de asistencias
    this.clients.forEach(client => {
      try {
        client.write(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        console.error('Error enviando notificación:', error);
        this.clients.delete(client);
      }
    });

    // También notificar al dashboard (las asistencias afectan métricas)
    this.notifyDashboardUpdate('asistencia', action);
  }

  // Notificar cambio en el dashboard (datos generales)
  notifyDashboardUpdate(source = 'general', action = 'update') {
    const message = {
      type: 'dashboard_update',
      source: source,
      action: action,
      timestamp: new Date().toISOString()
    };

    console.log(`📊 Notificando actualización del dashboard (${source}/${action}). Clientes: ${this.dashboardClients.size}`);

    // Enviar a todos los clientes del dashboard
    this.dashboardClients.forEach(client => {
      try {
        client.write(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        console.error('Error enviando notificación dashboard:', error);
        this.dashboardClients.delete(client);
      }
    });
  }
}

export default new NotificationService();
