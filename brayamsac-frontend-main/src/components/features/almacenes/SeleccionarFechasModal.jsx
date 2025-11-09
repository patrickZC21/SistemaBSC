import { Calendar, Download, X } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function SeleccionarFechasModal({ 
  open, 
  onClose, 
  fechas = [], 
  onDescargar, 
  loading = false 
}) {
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);
  const [seleccionarTodas, setSeleccionarTodas] = useState(false);

  // Resetear selecciones cuando se abre el modal
  useEffect(() => {
    if (open) {
      console.log('🔄 Modal abierto - reseteo de selecciones'); // Debug
      console.log('📊 Fechas disponibles:', fechas); // Debug
      setFechasSeleccionadas([]);
      setSeleccionarTodas(false);
    }
  }, [open, fechas]);

  // Manejar selección de todas las fechas
  const handleSeleccionarTodas = () => {
    console.log('🔄 Toggle seleccionar todas:', !seleccionarTodas); // Debug
    if (seleccionarTodas) {
      setFechasSeleccionadas([]);
    } else {
      const todasLasFechas = fechas.map(f => f.idfecha || f.id).filter(id => id !== undefined);
      console.log('📊 Seleccionando todas las fechas:', todasLasFechas); // Debug
      setFechasSeleccionadas(todasLasFechas);
    }
    setSeleccionarTodas(!seleccionarTodas);
  };

  // Manejar selección individual de fechas
  const handleToggleFecha = (fechaId) => {
    console.log('🔄 Toggle fecha:', fechaId); // Debug
    setFechasSeleccionadas(prev => {
      const nuevasSeleccionadas = prev.includes(fechaId)
        ? prev.filter(id => id !== fechaId)
        : [...prev, fechaId];
      
      console.log('📊 Fechas seleccionadas:', nuevasSeleccionadas); // Debug
      
      // Actualizar el estado de "seleccionar todas"
      setSeleccionarTodas(nuevasSeleccionadas.length === fechas.length);
      
      return nuevasSeleccionadas;
    });
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no válida';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  };

  const handleDescargar = () => {
    console.log('🚀 handleDescargar called'); // Debug
    console.log('📊 fechasSeleccionadas:', fechasSeleccionadas); // Debug
    console.log('📋 fechas disponibles:', fechas); // Debug
    
    if (fechasSeleccionadas.length > 0) {
      const fechasParaDescargar = fechas.filter(f => {
        const fechaId = f.idfecha || f.id;
        return fechasSeleccionadas.includes(fechaId);
      });
      
      console.log('📤 fechasParaDescargar:', fechasParaDescargar); // Debug
      onDescargar(fechasParaDescargar);
    } else {
      console.warn('⚠️ No hay fechas seleccionadas'); // Debug
    }
  };

  if (!open) return null;

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100vw", 
      height: "100vh", 
      background: "rgba(0,0,0,0.5)", 
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ 
        maxWidth: 600, 
        width: "90%",
        background: "#fff", 
        borderRadius: 16, 
        padding: 24, 
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "2px solid #f3f4f6"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Calendar size={24} color="#059669" />
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: 24, 
              margin: 0,
              color: "#1f2937"
            }}>
              Seleccionar Fechas para Excel
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              padding: 8,
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseOver={e => e.target.style.background = "#f3f4f6"}
            onMouseOut={e => e.target.style.background = "none"}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Seleccionar todas */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            padding: "12px 16px",
            background: "#f8fafc",
            borderRadius: 8,
            cursor: "pointer",
            border: "2px solid #e2e8f0"
          }}>
            <input
              type="checkbox"
              checked={seleccionarTodas}
              onChange={handleSeleccionarTodas}
              style={{ 
                width: 18, 
                height: 18, 
                cursor: "pointer"
              }}
            />
            <span style={{ 
              fontWeight: 600, 
              fontSize: 16,
              color: "#374151"
            }}>
              Seleccionar todas las fechas ({fechas.length})
            </span>
          </label>
        </div>

        {/* Lista de fechas */}
        <div style={{ 
          flex: 1,
          overflowY: "auto", 
          marginBottom: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 8
        }}>
          {fechas.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              color: "#6b7280", 
              padding: 40,
              fontSize: 16
            }}>
              No hay fechas disponibles
            </div>
          ) : (
            fechas.map(fecha => {
              const fechaId = fecha.idfecha || fecha.id;
              const estaSeleccionada = fechasSeleccionadas.includes(fechaId);
              
              return (
              <label 
                key={fechaId} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "12px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  background: estaSeleccionada 
                    ? "#ecfdf5" 
                    : "transparent",
                  border: estaSeleccionada ? "1px solid #10b981" : "1px solid transparent"
                }}
                onMouseOver={e => {
                  if (!estaSeleccionada) {
                    e.currentTarget.style.background = "#f9fafb";
                  }
                }}
                onMouseOut={e => {
                  if (!estaSeleccionada) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={estaSeleccionada}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleFecha(fechaId);
                  }}
                  style={{ 
                    width: 18, 
                    height: 18, 
                    cursor: "pointer",
                    accentColor: "#10b981"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 600, 
                    fontSize: 15,
                    color: "#1f2937",
                    marginBottom: 2
                  }}>
                    {formatearFecha(fecha.fecha)}
                  </div>
                </div>
                <div style={{
                  fontSize: 12,
                  color: "#4b5563",
                  fontWeight: 500
                }}>
                  {estaSeleccionada ? "✓ Seleccionada" : ""}
                </div>
              </label>
              );
            })
          )}
        </div>

        {/* Información de selección */}
        {fechasSeleccionadas.length > 0 && (
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: 14, 
              color: "#1e40af",
              fontWeight: 500
            }}>
              📊 {fechasSeleccionadas.length} fecha{fechasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{fechasSeleccionadas.length !== 1 ? 's' : ''} para exportar
            </p>
          </div>
        )}

        {/* Botones */}
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: 12 
        }}>
          <button 
            onClick={onClose} 
            style={{ 
              padding: "12px 24px", 
              borderRadius: 8, 
              border: "2px solid #e5e7eb", 
              background: "#fff", 
              fontWeight: 600,
              fontSize: 14,
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={e => {
              e.target.style.background = "#f9fafb";
              e.target.style.borderColor = "#d1d5db";
            }}
            onMouseOut={e => {
              e.target.style.background = "#fff";
              e.target.style.borderColor = "#e5e7eb";
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleDescargar}
            disabled={fechasSeleccionadas.length === 0 || loading}
            style={{ 
              padding: "12px 24px", 
              borderRadius: 8, 
              border: "none", 
              background: fechasSeleccionadas.length === 0 || loading ? "#d1d5db" : "#059669", 
              color: "#fff", 
              fontWeight: 600,
              fontSize: 14,
              cursor: fechasSeleccionadas.length === 0 || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background-color 0.2s"
            }}
            onMouseOver={e => {
              if (fechasSeleccionadas.length > 0 && !loading) {
                e.target.style.background = "#047857";
              }
            }}
            onMouseOut={e => {
              if (fechasSeleccionadas.length > 0 && !loading) {
                e.target.style.background = "#059669";
              }
            }}
          >
            <Download size={16} />
            {loading ? "Descargando..." : `Descargar Excel (${fechasSeleccionadas.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
