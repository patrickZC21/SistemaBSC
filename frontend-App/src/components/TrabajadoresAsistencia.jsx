import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getTrabajadoresBatch, getTodosTrabajadoresOptimized } from '../services/trabajadorOptimized.service';
import { statusLabels, getStatusLetter } from '../hooks/asistencia.constants';
import AsistenciaHeader from './AsistenciaHeader';
import ListaTrabajadoresAsistencia from './ListaTrabajadoresAsistencia';
import { useAsistenciaEstados } from '../hooks/useAsistenciaEstados';
import AgregarTrabajadorModal from './AgregarTrabajadorModal';
import { usePreventFormExit } from '../hooks/usePreventAppClose';
import { buildApiUrl, tokenManager, apiRequest, logger, apiCache } from '../config/app-security.js';
import { useOptimizedState, useDebounce } from '../hooks/useOptimized';

const TrabajadoresAsistencia = ({ trabajadores, asistencias = [], onRefreshAsistencias }) => {
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  
  // Estados optimizados con cache
  const {
    state: trabajadoresInfo,
    setState: setTrabajadoresInfo,
    loading: loadingTrabajadoresInfo,
    updateState: updateTrabajadoresInfo
  } = useOptimizedState({}, 'trabajadores_info');
  
  const {
    state: todosTrabajadores,
    setState: setTodosTrabajadores,
    loading: loadingTrabajadores,
    error: errorTrabajadores,
    updateState: updateTodosTrabajadores
  } = useOptimizedState([], 'todos_trabajadores');
  
  // Asegurar que existe usuario_id
  const usuarioId = tokenManager.get('usuario_id') || '1';
  const {
    showHoraInputs, setShowHoraInputs,
    horas, setHoras,
    guardado, setGuardado,
    showObsInputs, setShowObsInputs,
    observaciones, setObservaciones,
    obsGuardado, setObsGuardado,
    fGuardado, setFGuardado,
    showFaltaInputs, setShowFaltaInputs
  } = useAsistenciaEstados();

  // Detectar si hay cambios sin guardar para prevenir cierre accidental
  const hasUnsavedChanges = Object.keys(showHoraInputs).some(id => showHoraInputs[id] && !guardado[id]) ||
                           Object.keys(showObsInputs).some(id => showObsInputs[id] && !obsGuardado[id]) ||
                           Object.keys(showFaltaInputs).some(id => showFaltaInputs[id] && !fGuardado[id]);
  
  // Hook para prevenir cierre accidental cuando hay cambios sin guardar
  usePreventFormExit(hasUnsavedChanges);

  // Función optimizada para cargar información de trabajadores
  const cargarTrabajadoresInfo = useCallback(async (asistenciasData) => {
    if (!asistenciasData || asistenciasData.length === 0) {
      setTrabajadoresInfo({});
      return;
    }

    const uniqueIds = [...new Set(asistenciasData.map(a => a.trabajador_id))];
    const cacheKey = `trabajadores_info_${uniqueIds.sort().join('_')}`;
    
    await updateTrabajadoresInfo(
      async () => {
        // Verificar qué trabajadores ya tenemos en cache individual
        const info = {};
        const idsToFetch = [];
        
        for (const id of uniqueIds) {
          const cached = apiCache.get(`trabajador_${id}`);
          if (cached) {
            info[id] = cached;
          } else {
            idsToFetch.push(id);
          }
        }
        
        // Usar el servicio optimizado para cargar trabajadores en lote
         const trabajadoresData = await getTrabajadoresBatch(uniqueIds);
         trabajadoresData.forEach(t => {
           if (t && t.id) {
             info[t.id] = t;
           }
         });
        
        return info;
      },
      { useCache: true, cacheTime: 10 * 60 * 1000 } // Cache por 10 minutos
    );
  }, [updateTrabajadoresInfo, setTrabajadoresInfo]);

  // Cargar información de trabajadores cuando cambien las asistencias
  useEffect(() => {
    cargarTrabajadoresInfo(asistencias);
  }, [asistencias, cargarTrabajadoresInfo]);

  useEffect(() => {
    // Inicializar horas desde asistencias
    if (asistencias && asistencias.length > 0) {
      setHoras(prev => {
        const horasBD = { ...prev };
        asistencias.forEach(a => {
          if (!horasBD[a.trabajador_id] || (!horasBD[a.trabajador_id].ingreso && !horasBD[a.trabajador_id].salida)) {
            horasBD[a.trabajador_id] = {
              ingreso: a.hora_entrada ? a.hora_entrada.slice(0,5) : '',
              salida: a.hora_salida ? a.hora_salida.slice(0,5) : ''
            };
          }
        });
        return horasBD;
      });
    }
  }, [asistencias, setHoras]);

  // Memoizar filtros para evitar recálculos innecesarios
  const filteredData = useMemo(() => {
    if (!searchText) {
      return {
        trabajadoresInfo: Object.values(trabajadoresInfo),
        asistencias: asistencias
      };
    }
    
    const searchLower = searchText.toLowerCase();
    const filteredTrabajadoresInfo = Object.values(trabajadoresInfo).filter(t => {
      const nombre = t?.nombre?.toLowerCase() || "";
      const apellido = t?.apellido?.toLowerCase() || "";
      return nombre.includes(searchLower) || apellido.includes(searchLower);
    });
    
    const filteredIds = filteredTrabajadoresInfo.map(t => t.id);
    const filteredAsistencias = asistencias.filter(a => filteredIds.includes(a.trabajador_id));
    
    return {
      trabajadoresInfo: filteredTrabajadoresInfo,
      asistencias: filteredAsistencias
    };
  }, [trabajadoresInfo, asistencias, searchText]);

  // Memoizar trabajadores disponibles
  const trabajadoresDisponibles = useMemo(() => {
    const trabajadoresEnAsistencia = new Set(asistencias.map(a => a.trabajador_id));
    const disponibles = Array.isArray(todosTrabajadores)
      ? todosTrabajadores.filter(t => !trabajadoresEnAsistencia.has(t.id))
      : [];
    logger.log('Trabajadores disponibles para agregar:', disponibles.length);
    return disponibles;
  }, [todosTrabajadores, asistencias]);

  // Handler para agregar trabajadores seleccionados
  const handleAgregarTrabajadores = async (ids) => {
    // Crear asistencia para cada trabajador seleccionado
    const subalmacenId = asistencias[0]?.subalmacen_id;
    const programacionFechaId = asistencias[0]?.programacion_fecha_id;
    const registradoPor = usuarioId || 1; // Por defecto usar ID 1 si no existe
    
    logger.log('Datos para agregar:', { subalmacenId, programacionFechaId, registradoPor, ids });
    logger.log('Primera asistencia completa:', asistencias[0]);
    
    if (!subalmacenId || !programacionFechaId) {
      alert('No se pudo determinar subalmacén o fecha de la asistencia actual.');
      return;
    }
    
    try {
      const { crearAsistenciaOptimized } = await import('../services/asistenciaOptimized.service');
      
      for (const id of ids) {
        const asistenciaData = {
          trabajador_id: id,
          subalmacen_id: subalmacenId,
          programacion_fecha_id: programacionFechaId,
          registrado_por: parseInt(registradoPor),
          justificacion: 'Sin novedades',
          hora_entrada: '00:00',
          hora_salida: '00:00'
        };
        
        logger.log('Enviando asistencia:', asistenciaData);
        await crearAsistenciaOptimized(asistenciaData);
      }
      
      logger.log('Llamando onRefreshAsistencias para actualizar la tabla...');
      if (typeof onRefreshAsistencias === 'function') {
        // Forzar la actualización después de un pequeño delay para asegurar que el backend procesó la inserción
        setTimeout(() => {
          onRefreshAsistencias();
          logger.log('onRefreshAsistencias ejecutado correctamente');
        }, 500);
      } else {
        logger.error('onRefreshAsistencias no es una función válida');
      }
    } catch (e) {
      logger.error('Error completo al agregar trabajadores:', e);
      alert('Error al agregar trabajadores: ' + e.message);
    }
    setModalOpen(false);
  };

  // Función optimizada para cargar todos los trabajadores
   const cargarTodosTrabajadores = useCallback(async () => {
     await updateTodosTrabajadores(
       async () => {
         return await getTodosTrabajadoresOptimized();
       },
       { useCache: true, cacheTime: 15 * 60 * 1000 } // Cache por 15 minutos
     );
   }, [updateTodosTrabajadores]);

  // Cargar trabajadores solo cuando se abre el modal y no están cacheados
  useEffect(() => {
    if (modalOpen && todosTrabajadores.length === 0) {
      cargarTodosTrabajadores();
    }
  }, [modalOpen, todosTrabajadores.length, cargarTodosTrabajadores]);

  // Debounce para el texto de búsqueda
  const debouncedSetSearchText = useDebounce(setSearchText, 300);

  return (
    <div style={{ width: '100%', fontFamily: 'inherit', background: '#fff', minHeight: '100vh' }}>
      <AsistenciaHeader
          titulo="Estado diario"
          descripcion="A: Asistencia | F: Falta | O: Observaciones"
          showSearch={true}
          showAddButton={true}
          searchText={searchText}
          setSearchText={debouncedSetSearchText}
          onAddButtonClick={() => setModalOpen(true)}
        />
      <AgregarTrabajadorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trabajadores={trabajadoresDisponibles}
        onAgregar={handleAgregarTrabajadores}
      />
      <div style={{ width: '100%', background: '#fff', borderRadius: 0, boxShadow: 'none', padding: '0 8px', boxSizing: 'border-box' }}>
        <div style={{ fontWeight: 900, fontSize: 22, background: '#f4f4f4', borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: '22px 16px 18px 16px', borderBottom: '1px solid #eee', color: '#0a194e', letterSpacing: 0.2, textTransform: 'uppercase', textAlign: 'center' }}>
          lista de trabajadores
        </div>
        <ListaTrabajadoresAsistencia
          asistencias={filteredData.asistencias}
          trabajadoresInfo={trabajadoresInfo}
          guardado={guardado}
          fGuardado={fGuardado}
          obsGuardado={obsGuardado}
          showHoraInputs={showHoraInputs}
          showFaltaInputs={showFaltaInputs}
          showObsInputs={showObsInputs}
          horas={horas}
          setHoras={setHoras}
          setShowHoraInputs={setShowHoraInputs}
          setShowFaltaInputs={setShowFaltaInputs}
          setShowObsInputs={setShowObsInputs}
          setGuardado={setGuardado}
          setFGuardado={setFGuardado}
          setObsGuardado={setObsGuardado}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          statusLabels={statusLabels}
          getStatusLetter={getStatusLetter}
          onRefreshAsistencias={onRefreshAsistencias}
        />
      </div>
    </div>
  );
};

export default TrabajadoresAsistencia;
