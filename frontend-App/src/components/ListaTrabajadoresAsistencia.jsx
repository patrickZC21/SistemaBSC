import React, { useState, useEffect, useRef } from 'react';
import TrabajadorConHoras from './TrabajadorConHoras';
import { buildApiUrl, apiRequest, logger } from '../config/app-security.js';
import { usePreventAppClose } from '../hooks/usePreventAppClose';


const initialBtnState = { A: false, F: false, O: false };

const ListaTrabajadoresAsistencia = ({ asistencias = [], trabajadoresInfo = {} }) => {
  // Hook para manejar datos guardados/no guardados
  const { markDataAsSaved } = usePreventAppClose();
  
  // Estado local para los botones de cada trabajador
  const [btnStates, setBtnStates] = useState({});
  // Estado de horas, inicializado desde la BD (asistencias)
  const [horas, setHoras] = useState({});
  // Estado para edición de horas por trabajador
  const [editandoHoras, setEditandoHoras] = useState({});
  const [horasEdit, setHorasEdit] = useState({});
  // Estado para observaciones por trabajador
  const [observaciones, setObservaciones] = useState({});
  const [obsEdit, setObsEdit] = useState({});
  
  // Ref para manejar la posición del scroll
  const scrollPositionRef = useRef(null);

  // Inicializar horas y observaciones desde asistencias (solo la primera vez)
  useEffect(() => {
    logger.log('asistencias actualizadas:', asistencias);
    const horasIniciales = {};
    const obsIniciales = {};
    asistencias.forEach(a => {
      horasIniciales[a.trabajador_id] = {
        ingreso: a.hora_entrada ? a.hora_entrada.slice(0, 5) : '00:00',
        salida: a.hora_salida ? a.hora_salida.slice(0, 5) : '00:00'
      };
      obsIniciales[a.trabajador_id] = a.justificacion || '';
    });
    setHoras(horasIniciales);
    setObservaciones(obsIniciales);
    logger.log('horas iniciales:', horasIniciales);
    logger.log('observaciones iniciales:', obsIniciales);
  }, [asistencias]);

  // Inicializa el estado de los botones si no existe
  const ensureState = (id) => {
    if (!btnStates[id]) setBtnStates((prev) => ({ ...prev, [id]: { ...initialBtnState } }));
  };

  // Función para preservar y restaurar scroll
  const preservarScroll = () => {
    scrollPositionRef.current = window.scrollY;
  };

  const restaurarScroll = () => {
    if (scrollPositionRef.current !== null) {
      const target = scrollPositionRef.current;
      // Una sola restauración sin múltiples intentos
      requestAnimationFrame(() => {
        window.scrollTo({ top: target, left: 0, behavior: 'instant' });
        scrollPositionRef.current = null; // Limpiar inmediatamente
      });
    }
  };

  // Handler para iniciar edición de observación desde el child
  const handleStartEditObs = (trabajadorId, initialValue) => {
    setObsEdit(prev => ({ ...prev, [trabajadorId]: initialValue }));
  };

  // Lógica de los botones según reglas
  // Mostrar valores actuales de la BD al entrar en edición
  const handleBtnClick = (id, btn) => {
    logger.log('Botón presionado:', btn, 'para trabajador:', id);
    ensureState(id);
    
    // Lógica de botones sin preservar scroll
    
    setBtnStates((prev) => {
      const current = prev[id] || { ...initialBtnState };
      const h = horas[id] || { ingreso: '00:00', salida: '00:00' };
      if (h.ingreso === '00:00' && h.salida === '00:00') {
        // --- NUEVA LÓGICA: A y O son independientes, F es exclusivo ---
        if (btn === 'A') {
          if (!editandoHoras[id]) {
            setEditandoHoras((e) => ({ ...e, [id]: true }));
            setHorasEdit((e) => ({
              ...e,
              [id]: {
                hIn: h.ingreso.slice(0,2),
                mIn: h.ingreso.slice(3,5),
                hOut: h.salida.slice(0,2),
                mOut: h.salida.slice(3,5)
              }
            }));
            // Restaurar scroll después de abrir edición
            restaurarScroll();
          } else {
            setEditandoHoras((e) => ({ ...e, [id]: false }));
          }
          return {
            ...prev,
            [id]: {
              ...current,
              A: !current.A,
              F: false // F siempre se apaga si tocas A
            }
          };
        }
        if (btn === 'O') {
          return {
            ...prev,
            [id]: {
              ...current,
              O: !current.O,
              F: false // F siempre se apaga si tocas O
            }
          };
        }
        if (btn === 'F') {
          // F apaga todo menos F
          return {
            ...prev,
            [id]: { A: false, F: !current.F, O: false }
          };
        }
      } else {
        // Si hay horas, solo puedes alternar O junto a A
        if (btn === 'A') {
          return {
            ...prev,
            [id]: { A: !current.A, F: false, O: current.O }
          };
        }
        if (btn === 'O') {
          return {
            ...prev,
            [id]: { A: current.A, F: false, O: !current.O }
          };
        }
        if (btn === 'F') {
          // Si hay horas, F apaga todo
          return {
            ...prev,
            [id]: { A: false, F: !current.F, O: false }
          };
        }
      }
      return prev;
    });
  };

  // Utilidad para formatear y validar hora/minuto
  const pad2 = (v) => v.toString().padStart(2, '0');
  const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v)));

  // Guardar horas editadas (unifica los inputs)
  const handleGuardar = async (asistenciaId) => {
    // Preservar posición del scroll antes de guardar
    preservarScroll();
    
    // Buscar el trabajador_id correspondiente a esta asistencia
    const asistencia = asistencias.find(a => a.id === asistenciaId);
    if (!asistencia) {
      alert('No se encontró la asistencia.');
      return;
    }
    const trabajadorId = asistencia.trabajador_id;
    const h = horasEdit[trabajadorId];
    const nuevaHoraEntrada = `${pad2(clamp(h.hIn,0,23))}:${pad2(clamp(h.mIn,0,59))}`;
    const nuevaHoraSalida = `${pad2(clamp(h.hOut,0,23))}:${pad2(clamp(h.mOut,0,59))}`;
    // Lógica local
    setHoras((prev) => ({
      ...prev,
      [trabajadorId]: {
        ingreso: nuevaHoraEntrada,
        salida: nuevaHoraSalida
      }
    }));
    setEditandoHoras((e) => ({ ...e, [trabajadorId]: false }));
    
    // Llamada al backend para guardar en la base de datos
    try {
      const url = buildApiUrl(`/api/asistencias/${asistenciaId}`);
      await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          hora_entrada: nuevaHoraEntrada,
          hora_salida: nuevaHoraSalida,
        }),
      });
      logger.log('Horas guardadas correctamente en backend');
      // Marcar datos como guardados para prevenir scroll automático
      markDataAsSaved();
      // Restaurar posición del scroll después de guardar
      restaurarScroll();
    } catch (error) {
      logger.error('Error al guardar en backend:', error);
      alert('No se pudo guardar en el backend. Intenta de nuevo.');
    }
  };

  // Guardar observación en backend y local
  const handleGuardarObs = async (trabajadorId, textoJustificacion) => {
    // Preservar posición del scroll antes de guardar
    preservarScroll();
    
    // Buscar la asistencia correspondiente
    const asistencia = asistencias.find(a => a.trabajador_id === trabajadorId);
    if (!asistencia) return;
    const asistenciaId = asistencia.id;
    const nuevaObs = textoJustificacion !== undefined ? textoJustificacion : (obsEdit[trabajadorId] || '');
    try {
      const url = buildApiUrl(`/api/asistencias/${asistenciaId}`);
      await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify({ justificacion: nuevaObs })
      });
      setObservaciones(prev => ({ ...prev, [trabajadorId]: nuevaObs }));
      setObsEdit(prev => {
        const nuevo = { ...prev };
        delete nuevo[trabajadorId]; // Limpiar edición tras guardar
        return nuevo;
      });
      logger.log('Observación guardada correctamente en backend');
      // Marcar datos como guardados para prevenir scroll automático
      markDataAsSaved();
      // Restaurar posición del scroll después de guardar
      restaurarScroll();
    } catch (error) {
      logger.error('Error al guardar observación en backend:', error);
      alert('No se pudo guardar la observación en el backend. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {asistencias.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>
          No hay trabajadores para mostrar.
        </div>
      )}
      {[...asistencias]
        .filter(a => trabajadoresInfo[a.trabajador_id])
        .sort((a, b) => {
          const nombreA = (trabajadoresInfo[a.trabajador_id]?.nombre || '').toLowerCase().trim();
          const nombreB = (trabajadoresInfo[b.trabajador_id]?.nombre || '').toLowerCase().trim();
          // Si hay varios nombres, compara por la primera palabra
          const primerA = nombreA.split(' ')[0];
          const primerB = nombreB.split(' ')[0];
          return primerA.localeCompare(primerB);
        })
        .map((a) => {
          const t = trabajadoresInfo[a.trabajador_id];
          if (!t) return null;
          const h = horas[a.trabajador_id] || { ingreso: '00:00', salida: '00:00' };
          let btn = btnStates[a.trabajador_id] || initialBtnState;
          // Forzar O activo si tiene horas y observación válida
          const obsValida = observaciones[a.trabajador_id] && observaciones[a.trabajador_id].trim() !== '' && observaciones[a.trabajador_id].trim().toLowerCase() !== 'sin novedades';
          if (obsValida && !btn.O) {
            btn = { ...btn, O: true };
          }
          // Mostrar siempre TrabajadorConHoras
          return (
              <TrabajadorConHoras
              key={a.id}
              t={t}
              a={a}
              h={h}
              btn={{
                ...btn,
                onOClick: (id) => handleBtnClick(id, 'O'),
                onFClick: (id) => handleBtnClick(id, 'F')
              }}
              observaciones={observaciones}
              obsEdit={obsEdit}
              editandoHoras={editandoHoras}
              horasEdit={horasEdit}
              handleGuardar={handleGuardar}
              setEditandoHoras={setEditandoHoras}
              setHorasEdit={setHorasEdit}
              pad2={pad2}
              clamp={clamp}
              handleGuardarObs={handleGuardarObs}
              setObsEdit={setObsEdit}
              startEditObs={handleStartEditObs}
            />
          );
        })}
    </div>
  );
};

export default ListaTrabajadoresAsistencia;