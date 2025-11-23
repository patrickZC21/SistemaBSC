import React, { useState, useEffect } from 'react';
import { obtenerFechaActual, obtenerInfoFechaActual, esFechaActual, formatearFecha } from '../utils/dateValidation';

/**
 * Componente de prueba para verificar la validación de fechas
 * Muestra información detallada sobre la fecha actual del sistema
 */
export default function DateValidationTest() {
  const [info, setInfo] = useState(null);
  const [fechaPrueba, setFechaPrueba] = useState('');
  const [resultadoPrueba, setResultadoPrueba] = useState(null);

  useEffect(() => {
    // Obtener información de la fecha al cargar el componente
    const infoFecha = obtenerInfoFechaActual();
    setInfo(infoFecha);
    
    // Establecer la fecha actual como fecha de prueba inicial
    setFechaPrueba(infoFecha.fechaNormalizada);
  }, []);

  const handlePrueba = () => {
    if (fechaPrueba) {
      const esValida = esFechaActual(fechaPrueba);
      setResultadoPrueba({
        fecha: fechaPrueba,
        esValida,
        fechaFormateada: formatearFecha(fechaPrueba)
      });
    }
  };

  if (!info) return <div>Cargando información de fecha...</div>;

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ color: '#333', marginBottom: '16px' }}>
        🔍 Información de Validación de Fechas
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#666', marginBottom: '8px' }}>📅 Información del Sistema:</h4>
        <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '4px', fontSize: '12px' }}>
          <div><strong>Fecha completa:</strong> {info.fechaCompleta}</div>
          <div><strong>Fecha ISO:</strong> {info.fechaISO}</div>
          <div><strong>Fecha local:</strong> {info.fechaLocal}</div>
          <div><strong>Fecha normalizada (YYYY-MM-DD):</strong> <span style={{color: '#e74c3c', fontWeight: 'bold'}}>{info.fechaNormalizada}</span></div>
          <div><strong>Zona horaria:</strong> {info.zonaHoraria}</div>
          <div><strong>Timestamp:</strong> {info.timestamp}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#666', marginBottom: '8px' }}>🧪 Probar Validación:</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <input
            type="text"
            value={fechaPrueba}
            onChange={(e) => setFechaPrueba(e.target.value)}
            placeholder="Ingresa una fecha (YYYY-MM-DD o DD/MM/YYYY)"
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px',
              width: '250px'
            }}
          />
          <button
            onClick={handlePrueba}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Probar
          </button>
        </div>
        
        {resultadoPrueba && (
          <div style={{ 
            backgroundColor: resultadoPrueba.esValida ? '#d4edda' : '#f8d7da', 
            padding: '12px', 
            borderRadius: '4px',
            border: `1px solid ${resultadoPrueba.esValida ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '12px'
          }}>
            <div><strong>Fecha probada:</strong> {resultadoPrueba.fecha}</div>
            <div><strong>Fecha formateada:</strong> {resultadoPrueba.fechaFormateada}</div>
            <div><strong>¿Es fecha actual?:</strong> 
              <span style={{ 
                color: resultadoPrueba.esValida ? '#155724' : '#721c24',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {resultadoPrueba.esValida ? '✅ SÍ' : '❌ NO'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ fontSize: '11px', color: '#666', marginTop: '16px', fontStyle: 'italic' }}>
        💡 Este componente es solo para pruebas. La fecha actual real del sistema es: <strong>{info.fechaNormalizada}</strong>
      </div>
    </div>
  );
}
