import React, { memo, useCallback, useMemo, useRef } from 'react';
import { updateAsistenciaOptimized } from '../services/asistenciaOptimized.service';
import { logger } from '../config/app-security.js';
import { useDebounce } from '../hooks/useOptimized';
import { usePreventAppClose } from '../hooks/usePreventAppClose';

// Componente optimizado para items individuales de asistencia
const AsistenciaItemOptimized = memo(({ 
  asistencia, 
  trabajadorInfo, 
  onUpdate,
  showHoraInputs,
  setShowHoraInputs,
  horas,
  setHoras,
  guardado,
  setGuardado
}) => {
  const trabajadorId = asistencia.trabajador_id;
  
  // Hook para manejar datos guardados/no guardados
  const { markDataAsSaved } = usePreventAppClose();
  
  // Ref para manejar la posición del scroll
  const scrollPositionRef = useRef(null);
  
  // Función para preservar y restaurar scroll
  const preservarScroll = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
  }, []);
  
  const restaurarScroll = useCallback(() => {
    if (scrollPositionRef.current !== null) {
      const target = scrollPositionRef.current;
      requestAnimationFrame(() => {
        window.scrollTo({ top: target, left: 0, behavior: 'instant' });
        scrollPositionRef.current = null;
      });
    }
  }, []);
  
  // Memoizar datos del trabajador para evitar recálculos
  const trabajadorData = useMemo(() => {
    return trabajadorInfo || {
      nombre: asistencia.trabajador_nombre || 'Sin nombre',
      apellido: asistencia.trabajador_apellido || '',
      dni: asistencia.trabajador_dni || ''
    };
  }, [trabajadorInfo, asistencia]);
  
  // Función optimizada para actualizar horas con debounce
  const updateHorasDebounced = useDebounce(async (id, newHoras) => {
    // Preservar posición del scroll antes de guardar
    preservarScroll();
    
    try {
      await updateAsistenciaOptimized(id, {
        hora_entrada: newHoras.ingreso || null,
        hora_salida: newHoras.salida || null
      });
      
      setGuardado(prev => ({ ...prev, [trabajadorId]: true }));
      
      // Marcar datos como guardados para prevenir scroll automático
      markDataAsSaved();
      
      // Restaurar posición del scroll después de guardar
      restaurarScroll();
      
      logger.log('Horas actualizadas exitosamente:', { id, newHoras });
    } catch (error) {
      logger.error('Error al actualizar horas:', error);
      setGuardado(prev => ({ ...prev, [trabajadorId]: false }));
    }
  }, 1000);
  
  // Handler optimizado para cambios de hora
  const handleHoraChange = useCallback((tipo, valor) => {
    const newHoras = {
      ...horas[trabajadorId],
      [tipo]: valor
    };
    
    setHoras(prev => ({
      ...prev,
      [trabajadorId]: newHoras
    }));
    
    // Marcar como no guardado temporalmente
    setGuardado(prev => ({ ...prev, [trabajadorId]: false }));
    
    // Actualizar con debounce
    updateHorasDebounced(asistencia.id, newHoras);
  }, [trabajadorId, horas, setHoras, setGuardado, updateHorasDebounced, asistencia.id]);
  
  // Toggle para mostrar inputs de hora
  const toggleHoraInputs = useCallback(() => {
    setShowHoraInputs(prev => ({
      ...prev,
      [trabajadorId]: !prev[trabajadorId]
    }));
  }, [trabajadorId, setShowHoraInputs]);
  
  // Memoizar el estado de guardado para este trabajador
  const isGuardado = useMemo(() => {
    return guardado[trabajadorId] !== false;
  }, [guardado, trabajadorId]);
  
  // Memoizar las horas actuales
  const horasActuales = useMemo(() => {
    return horas[trabajadorId] || {
      ingreso: asistencia.hora_entrada ? asistencia.hora_entrada.slice(0, 5) : '',
      salida: asistencia.hora_salida ? asistencia.hora_salida.slice(0, 5) : ''
    };
  }, [horas, trabajadorId, asistencia.hora_entrada, asistencia.hora_salida]);
  
  return (
    <div className="asistencia-item" style={{
      padding: '12px',
      borderBottom: '1px solid #eee',
      backgroundColor: isGuardado ? '#fff' : '#fff3cd'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{trabajadorData.nombre} {trabajadorData.apellido}</strong>
          {trabajadorData.dni && <span style={{ color: '#666', marginLeft: '8px' }}>({trabajadorData.dni})</span>}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isGuardado && (
            <span style={{ color: '#856404', fontSize: '12px' }}>Guardando...</span>
          )}
          
          <button 
            onClick={toggleHoraInputs}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: showHoraInputs[trabajadorId] ? '#007bff' : '#fff',
              color: showHoraInputs[trabajadorId] ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            {showHoraInputs[trabajadorId] ? 'Ocultar' : 'Editar'} Horas
          </button>
        </div>
      </div>
      
      {showHoraInputs[trabajadorId] && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Hora Ingreso:</label>
            <input
              type="time"
              value={horasActuales.ingreso}
              onChange={(e) => handleHoraChange('ingreso', e.target.value)}
              style={{
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Hora Salida:</label>
            <input
              type="time"
              value={horasActuales.salida}
              onChange={(e) => handleHoraChange('salida', e.target.value)}
              style={{
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        Estado: {asistencia.estado || 'Presente'} | 
        Ingreso: {asistencia.hora_entrada || 'No registrado'} | 
        Salida: {asistencia.hora_salida || 'No registrado'}
      </div>
    </div>
  );
});

AsistenciaItemOptimized.displayName = 'AsistenciaItemOptimized';

export default AsistenciaItemOptimized;