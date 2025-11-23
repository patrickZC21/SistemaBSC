import React, { useEffect, useState, useRef } from 'react';
import { logger } from '../config/app-security.js';
import cacheManager from '../services/cacheManager.service.js';

/**
 * Componente para monitorear el rendimiento de la aplicación
 * Solo se muestra en modo desarrollo
 */
const PerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    cache: { total: 0, byType: {}, expired: 0 },
    requests: { total: 0, failed: 0, avgTime: 0 },
    renders: 0,
    memory: { used: 0, total: 0 }
  });
  
  const renderCountRef = useRef(0);
  const requestStatsRef = useRef({ total: 0, failed: 0, totalTime: 0 });
  
  // Solo mostrar en desarrollo
  const isDevelopment = import.meta.env.DEV;
  
  useEffect(() => {
    if (!isDevelopment) return;
    
    renderCountRef.current++;
    
    // Actualizar estadísticas cada 5 segundos
    const interval = setInterval(() => {
      updateStats();
    }, 5000);
    
    // Monitorear requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      requestStatsRef.current.total++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        requestStatsRef.current.totalTime += (endTime - startTime);
        
        if (!response.ok) {
          requestStatsRef.current.failed++;
        }
        
        return response;
      } catch (error) {
        requestStatsRef.current.failed++;
        throw error;
      }
    };
    
    return () => {
      clearInterval(interval);
      window.fetch = originalFetch;
    };
  }, [isDevelopment]);
  
  const updateStats = () => {
    const cacheStats = cacheManager.getStats();
    const requestStats = requestStatsRef.current;
    
    // Obtener información de memoria si está disponible
    let memoryInfo = { used: 0, total: 0 };
    if (performance.memory) {
      memoryInfo = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      };
    }
    
    setStats({
      cache: cacheStats,
      requests: {
        total: requestStats.total,
        failed: requestStats.failed,
        avgTime: requestStats.total > 0 ? Math.round(requestStats.totalTime / requestStats.total) : 0
      },
      renders: renderCountRef.current,
      memory: memoryInfo
    });
  };
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const clearCache = () => {
    cacheManager.clearAll();
    logger.log('Cache limpiado manualmente desde Performance Monitor');
    updateStats();
  };
  
  const clearExpiredCache = () => {
    cacheManager.clearExpired();
    logger.log('Cache expirado limpiado desde Performance Monitor');
    updateStats();
  };
  
  if (!isDevelopment) return null;
  
  return (
    <>
      {/* Botón flotante para mostrar/ocultar */}
      <button
        onClick={toggleVisibility}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
        title="Performance Monitor"
      >
        📊
      </button>
      
      {/* Panel de estadísticas */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          minWidth: '300px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>
            📊 Performance Monitor
          </div>
          
          {/* Estadísticas de Cache */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>🗄️ Cache:</div>
            <div>Total: {stats.cache.total} entradas</div>
            <div>Expiradas: {stats.cache.expired}</div>
            {Object.entries(stats.cache.byType).map(([type, count]) => (
              <div key={type}>{type}: {count}</div>
            ))}
          </div>
          
          {/* Estadísticas de Requests */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#2196F3' }}>🌐 Requests:</div>
            <div>Total: {stats.requests.total}</div>
            <div>Fallidos: {stats.requests.failed}</div>
            <div>Tiempo promedio: {stats.requests.avgTime}ms</div>
          </div>
          
          {/* Estadísticas de Renders */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#FF9800' }}>🔄 Renders:</div>
            <div>Total: {stats.renders}</div>
          </div>
          
          {/* Estadísticas de Memoria */}
          {stats.memory.total > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#9C27B0' }}>💾 Memoria:</div>
              <div>Usada: {stats.memory.used}MB</div>
              <div>Total: {stats.memory.total}MB</div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
            <button
              onClick={clearExpiredCache}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '5px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Limpiar Expirado
            </button>
            <button
              onClick={clearCache}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '5px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Limpiar Todo
            </button>
            <button
              onClick={updateStats}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '5px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Actualizar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;