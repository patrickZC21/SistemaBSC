import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AgregarRotacionModal from "@/components/features/asistencias/AgregarRotacionModal";
import AsistenciasHeader from "@/components/features/asistencias/AsistenciasHeader";
import AsistenciasTable from "@/components/features/asistencias/AsistenciasTable";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { tokenManager, logger } from "../config/security.js";
import { useAsistencias } from "../hooks/useAsistencias";
import { useUser } from "../hooks/useAuthUser";
import { eliminarAsistencia } from "../services/asistencia.service.js";
import { crearRotacionTrabajador } from "../services/rotacion.service.js";

function isValidDate(fecha) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}

export default function ComponenteAsistencia() {
  const { subalmacenId, fecha } = useParams();
  const navigate = useNavigate();

  const usuario = useUser();
  const { asistencias, loading, almacenNombre, subalmacenNombre, refetchAsistencias } = useAsistencias(subalmacenId, fecha, navigate);

  const nombreAlmacen = almacenNombre || (asistencias[0]?.almacen_nombre ?? "");
  const nombreSubalmacen = subalmacenNombre || (asistencias[0]?.subalmacen_nombre ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [advertencia, setAdvertencia] = useState("");
  const [modalEliminar, setModalEliminar] = useState({ show: false, asistencia: null });

  const handleEditarAsistencia = (asis) => {
    logger.log("[Asistencias] Editar asistencia:", asis);
    // La edición ahora se maneja inline en la tabla
    // Esta función queda como placeholder por compatibilidad
  };

  const handleEliminarAsistencia = (asis) => {
    setModalEliminar({ show: true, asistencia: asis });
  };

  const confirmarEliminarAsistencia = async () => {
    const asis = modalEliminar.asistencia;
    setModalEliminar({ show: false, asistencia: null });
    if (!asis) return;
    
    const token = tokenManager.get();
    try {
      const res = await eliminarAsistencia(asis.id, token);
      if (!res.ok) {
        const errorData = await res.json();
        setAdvertencia(`Error al eliminar asistencia: ${  errorData.error || res.statusText}`);
      } else {
        setAdvertencia('Asistencia eliminada correctamente.');
        setTimeout(() => setAdvertencia(""), 2000);
        refetchAsistencias(); // Recargar asistencias
      }
    } catch (error) {
      logger.error('Error al eliminar asistencia:', error);
      setAdvertencia('Error al eliminar asistencia');
    }
  };

  if (!subalmacenId || !fecha || !isValidDate(fecha)) {
    return (
      <div className="flex min-h-screen">
        <div className="fixed top-0 left-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 ml-64 bg-gray-100">
          <Header usuario={usuario} />
          <main className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Asistencias</h2>
              <p className="text-gray-500 mb-4">
                Parámetros inválidos o fecha no seleccionada.
              </p>
              <button
                className="px-4 py-2 rounded bg-slate-800 text-white"
                onClick={() => navigate(-1)}
              >
                Volver
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="fixed top-0 left-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 ml-64 bg-gray-100">
        <Header usuario={usuario} />
        <main className="flex-1 p-6 overflow-auto">
          <ConfirmModal
            show={modalEliminar.show}
            mensaje={`¿Seguro que deseas eliminar la asistencia de ${modalEliminar.asistencia?.trabajador_nombre || ''}?`}
            onCancel={() => setModalEliminar({ show: false, asistencia: null })}
            onConfirm={confirmarEliminarAsistencia}
          />
          {advertencia && (
            <div className={`mb-4 px-4 py-2 rounded text-center ${advertencia.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{advertencia}</div>
          )}
          <AsistenciasHeader
            nombreAlmacen={nombreAlmacen}
            nombreSubalmacen={nombreSubalmacen}
            fecha={fecha}
            onAgregarRotacion={() => setModalOpen(true)}
          />
          {loading ? (
            <div className="text-gray-500 text-center py-10">
              Cargando asistencias...
            </div>
          ) : asistencias.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No hay asistencias registradas para esta fecha.
            </div>
          ) : (
            <AsistenciasTable
              asistencias={asistencias}
              onEditar={handleEditarAsistencia}
              onEliminar={handleEliminarAsistencia}
              onActualizarLista={refetchAsistencias}
            />
          )}
          <AgregarRotacionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            subalmacenActualId={subalmacenId}
            asistenciasActuales={asistencias}
            fechaActual={fecha}
            onAgregar={async (trabajadores) => {
              // Lógica para agregar rotaciones múltiples
              const token = localStorage.getItem('token');
              let errores = 0;
              let exitosos = 0;
              
              try {
                // Si recibe un solo trabajador (compatibilidad), convertir a array
                const trabajadoresList = Array.isArray(trabajadores) ? trabajadores : [trabajadores];
                
                // Procesar cada trabajador
                for (const trabajador of trabajadoresList) {
                  try {
                    const res = await crearRotacionTrabajador({
                      trabajador_id: trabajador.id,
                      subalmacen_id: subalmacenId,
                      fecha
                    }, token);
                    
                    if (!res.ok) {
                      const errorData = await res.json();
                      console.error(`Error al agregar ${trabajador.nombre}: ${errorData.message || res.statusText}`);
                      errores++;
                    } else {
                      exitosos++;
                    }
                  } catch (err) {
                    console.error(`Error de red al agregar ${trabajador.nombre}:`, err);
                    errores++;
                  }
                }
                
                // Mostrar resultado
                if (exitosos > 0 && errores === 0) {
                  // Actualizar asistencias si hubo éxito
                  setTimeout(() => {
                    refetchAsistencias();
                    console.log('Asistencias actualizadas después de agregar trabajadores');
                  }, 500);
                } else if (exitosos > 0 && errores > 0) {
                  alert(`Se agregaron ${exitosos} trabajadores correctamente. ${errores} fallaron.`);
                  setTimeout(() => {
                    refetchAsistencias();
                  }, 500);
                } else {
                  alert('Error al agregar los trabajadores seleccionados.');
                }
              } catch (err) {
                alert('Error general al procesar trabajadores.');
              }
              setModalOpen(false);
            }}
          />
        </main>
      </div>
    </div>
  );
}
