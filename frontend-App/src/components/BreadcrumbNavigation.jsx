import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInfoAlmacenSubalmacen } from '../services/infoAlmacenSubalmacen.service';

export default function BreadcrumbNavigation({ 
  subalmacenId, 
  showFechas = false, 
  currentFecha = null,
  almacenId = null 
}) {
  const navigate = useNavigate();
  const [info, setInfo] = useState({ almacen: '', subalmacen: '', almacen_id: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subalmacenId) {
      getInfoAlmacenSubalmacen(subalmacenId)
        .then(data => {
          setInfo(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error cargando info:', error);
          setLoading(false);
        });
    }
  }, [subalmacenId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          color: '#999'
        }}>
          Cargando...
        </div>
      </div>
    );
  }

  const buttonStyle = {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px',
    textAlign: 'center'
  };

  const buttonHoverStyle = {
    backgroundColor: '#45a049',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  };

  const separatorStyle = {
    fontSize: '18px',
    color: '#888',
    fontWeight: 'bold',
    margin: '0 8px'
  };

  const currentPageStyle = {
    ...buttonStyle,
    backgroundColor: '#2196F3',
    cursor: 'default'
  };

  const handleAlmacenClick = () => {
    // Navegar a la página de subalmacenes del almacén
    if (info.almacen_id) {
      navigate(`/subalmacenes/${info.almacen_id}`);
    } else {
      navigate('/dashboard-app');
    }
  };

  const handleSubalmacenClick = () => {
    // Navegar a la página de fechas del subalmacén
    if (subalmacenId) {
      navigate(`/subalmacenes/${subalmacenId}/fechas`);
    }
  };

  const handleFechasClick = () => {
    // Navegar a la página de fechas del subalmacén
    if (subalmacenId) {
      navigate(`/subalmacenes/${subalmacenId}/fechas`);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      marginBottom: '24px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Botón Almacén */}
      <button
        style={buttonStyle}
        onClick={handleAlmacenClick}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, buttonHoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, buttonStyle);
        }}
        title={`Ir a almacén: ${info.almacen}`}
      >
        🏢 {info.almacen || 'Almacén'}
      </button>

      <span style={separatorStyle}>\\</span>

      {/* Botón Subalmacén */}
      <button
        style={showFechas && !currentFecha ? currentPageStyle : buttonStyle}
        onClick={handleSubalmacenClick}
        onMouseEnter={(e) => {
          if (!showFechas || currentFecha) {
            Object.assign(e.target.style, buttonHoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          const baseStyle = showFechas && !currentFecha ? currentPageStyle : buttonStyle;
          Object.assign(e.target.style, baseStyle);
        }}
        title={`Ir a subalmacén: ${info.subalmacen}`}
      >
        🏪 {info.subalmacen || 'Subalmacén'}
      </button>

      {/* Mostrar Fechas solo si showFechas es true */}
      {showFechas && (
        <>
          <span style={separatorStyle}>\\</span>
          <button
            style={currentFecha ? buttonStyle : currentPageStyle}
            onClick={handleFechasClick}
            onMouseEnter={(e) => {
              if (currentFecha) {
                Object.assign(e.target.style, buttonHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              const baseStyle = currentFecha ? buttonStyle : currentPageStyle;
              Object.assign(e.target.style, baseStyle);
            }}
            title="Ver todas las fechas"
          >
            📅 Fechas
          </button>
        </>
      )}

      {/* Mostrar fecha actual si existe */}
      {currentFecha && (
        <>
          <span style={separatorStyle}>\\</span>
          <div style={{
            ...currentPageStyle,
            cursor: 'default'
          }}>
            📆 {currentFecha}
          </div>
        </>
      )}
    </div>
  );
}