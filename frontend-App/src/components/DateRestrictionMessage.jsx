import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatearFecha } from '../utils/dateValidation';

/**
 * Componente que muestra un mensaje de error cuando se intenta acceder 
 * a una fecha que no es la actual
 */
export default function DateRestrictionMessage({ 
  fechaSeleccionada, 
  fechaActual, 
  mensaje,
  subalmacenId 
}) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
        color: '#e17055'
      }}>
        🚫
      </div>
      
      <h3 style={{
        color: '#e17055',
        marginBottom: '16px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        Acceso Restringido
      </h3>
      
      <p style={{
        color: '#6c5ce7',
        marginBottom: '16px',
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        {mensaje}
      </p>
      
      <div style={{
        background: '#f8f9fa',
        padding: '12px',
        borderRadius: '6px',
        margin: '16px 0',
        fontSize: '14px',
        color: '#495057'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Fecha seleccionada:</strong> {formatearFecha(fechaSeleccionada)}
        </div>
        <div>
          <strong>Fecha actual del sistema:</strong> {formatearFecha(fechaActual)}
        </div>
      </div>
      
      <p style={{
        color: '#74b9ff',
        fontSize: '14px',
        marginBottom: '20px',
        fontStyle: 'italic'
      }}>
        Solo puedes registrar asistencias en la fecha actual: {formatearFecha(fechaActual)}
      </p>
      
      <button
        onClick={() => navigate(`/subalmacenes/${subalmacenId}/fechas`)}
        style={{
          background: '#0984e3',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = '#0770c2'}
        onMouseOut={(e) => e.target.style.background = '#0984e3'}
      >
        ← Volver a Fechas
      </button>
    </div>
  );
}
