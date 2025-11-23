// Componente para mostrar la lista de fechas de un subalmacen
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { esFechaActual } from '../utils/dateValidation';

export function SubalmacenFechasList({ fechas, subalmacenId }) {
  const navigate = useNavigate();
  if (!fechas || fechas.length === 0) {
    return <div>No hay fechas disponibles.</div>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {fechas.map((fecha, idx) => {
        let fechaMostrar = fecha;
        // Si es objeto, intenta extraer la propiedad correcta
        if (typeof fecha === 'object' && fecha !== null) {
          fechaMostrar = fecha.fecha || fecha;
        }
        // Formato DD/MM/YYYY - Corrección para evitar desfase de un día
        let fechaFormateada, fechaStr;
        
        if (typeof fechaMostrar === 'string' && fechaMostrar.includes('T')) {
          // Si viene con timestamp ISO, extraer solo la fecha y agregar T12:00:00
          const fechaSolo = fechaMostrar.split('T')[0];
          const dateObj = new Date(fechaSolo + 'T12:00:00');
          fechaFormateada = dateObj.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          fechaStr = fechaSolo;
        } else if (typeof fechaMostrar === 'string' && fechaMostrar.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Si viene en formato YYYY-MM-DD, convertir a DD/MM/YYYY
          const [year, month, day] = fechaMostrar.split('-');
          fechaFormateada = `${day}/${month}/${year}`;
          fechaStr = fechaMostrar;
        } else {
          // Fallback para otros formatos
          const dateObj = new Date(fechaMostrar + 'T12:00:00');
          fechaFormateada = dateObj instanceof Date && !isNaN(dateObj)
            ? dateObj.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : fechaMostrar;
          fechaStr = dateObj instanceof Date && !isNaN(dateObj)
            ? dateObj.toISOString().slice(0, 10)
            : fechaMostrar;
        }
        return (
          <li
            key={idx}
            style={{
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 6px #0001',
              margin: '12px 0',
              padding: '16px',
              fontSize: '1.1rem',
              color: '#444',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderLeft: `4px solid ${esFechaActual(fechaStr) ? '#4CAF50' : '#2196f3'}`,
              maxWidth: 500,
              minWidth: 350,
              width: '100%',
              opacity: esFechaActual(fechaStr) ? 1 : 0.7,
            }}
            onClick={() => {
              navigate(`/subalmacenes/${subalmacenId}/fechas/${fechaStr}`);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {esFechaActual(fechaStr) && (
                <span style={{ 
                  marginRight: '8px', 
                  fontSize: '16px',
                  color: '#4CAF50'
                }}>
                  ✅
                </span>
              )}
              <span>{fechaFormateada}</span>
              {esFechaActual(fechaStr) && (
                <span style={{ 
                  marginLeft: '8px', 
                  fontSize: '12px',
                  color: '#4CAF50',
                  fontWeight: 'bold'
                }}>
                  (HOY)
                </span>
              )}
            </div>
            <span
              style={{
                marginLeft: 'auto',
                color: '#bbb',
                fontSize: 22,
                lineHeight: 0,
              }}
            >
              &#8250;
            </span>
          </li>
        );
      })}
    </ul>
  );
}
