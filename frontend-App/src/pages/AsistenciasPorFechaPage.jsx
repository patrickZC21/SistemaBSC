import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrabajadoresAsistencia from '../components/TrabajadoresAsistencia';
import useAsistenciasOptimized from '../hooks/useAsistenciasOptimized';
import UserHeader from '../components/UserHeader';
import { useUsuario } from '../hooks/useUsuario';
import { getInfoAlmacenSubalmacen } from '../services/infoAlmacenSubalmacen.service';
import { useDateValidation } from '../hooks/useDateValidation';
import DateRestrictionMessage from '../components/DateRestrictionMessage';
import { logger } from '../config/app-security.js';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';

export default function AsistenciasPorFechaPage() {
  const { subalmacenId, fecha } = useParams();
  const { usuario, loading: loadingUsuario } = useUsuario();
  const [info, setInfo] = useState({ almacen: '', subalmacen: '' });
  
  // Validar si la fecha seleccionada es la actual
  const { esValida, mensaje, fechaActual, puedeAcceder } = useDateValidation(fecha);

  // Usar el hook optimizado con el subalmacenId
  const {
    trabajadores,
    asistencias,
    loading,
    error,
    cargarAsistencias,
    refreshAsistencias: refreshAsistenciasOptimized
  } = useAsistenciasOptimized(subalmacenId);

  // Manejar notificaciones SSE para actualización en tiempo real
  // useSSENotifications((notification) => {
  //   console.log('🔔 Notificación de cambio recibida:', notification);
  //   // Solo actualizar si el cambio es para el mismo subalmacén y fecha
  //   if (notification.subalmacen_id == subalmacenId && notification.fecha === fecha) {
  //     console.log('✅ Actualizando asistencias por notificación SSE');
  //     refreshAsistencias();
  //   }
  // });

  // Cargar datos reales al montar o cambiar fecha/subalmacen
  useEffect(() => {
    // Solo cargar asistencias si la fecha es válida
    if (puedeAcceder && fecha) {
      cargarAsistencias(fecha);
    }
    getInfoAlmacenSubalmacen(subalmacenId).then(setInfo);
  }, [subalmacenId, fecha, puedeAcceder, cargarAsistencias]);

  // Refrescar asistencias tras guardar (usando la función optimizada)
  const refreshAsistencias = () => {
    logger.log('🔄 refreshAsistencias llamado, recargando datos...');
    if (fecha && puedeAcceder) {
      refreshAsistenciasOptimized(fecha).then(data => {
        logger.log('✅ Datos actualizados después de agregar trabajador:', data?.length, 'asistencias');
      }).catch(error => {
        logger.error('❌ Error al recargar asistencias:', error);
      });
    } else {
      logger.error('❌ No hay fecha disponible o fecha no válida para refrescar asistencias');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <UserHeader name={usuario?.nombre} role={usuario?.nombre_rol} />
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 0, padding: 32, boxShadow: 'none' }}>
        <BreadcrumbNavigation 
          subalmacenId={subalmacenId} 
          showFechas={true}
          currentFecha={fecha}
        />
        <h2 style={{ color: '#888', fontWeight: 700, marginBottom: 16 }}>
          Asistencias del {info.subalmacen}
        </h2>
        <div style={{ fontSize: 18, marginBottom: 24 }}>
          Fecha seleccionada: <b>{fecha}</b>
        </div>
        
        {/* Mostrar mensaje de restricción si la fecha no es válida */}
        {!puedeAcceder ? (
          <DateRestrictionMessage 
            fechaSeleccionada={fecha}
            fechaActual={fechaActual}
            mensaje={mensaje}
            subalmacenId={subalmacenId}
          />
        ) : loading ? (
          <div style={{ color: '#aaa' }}>Cargando asistencias...</div>
        ) : (
          <TrabajadoresAsistencia trabajadores={trabajadores} asistencias={asistencias} onRefreshAsistencias={refreshAsistencias} />
        )}
      </div>
    </div>
  );
}
