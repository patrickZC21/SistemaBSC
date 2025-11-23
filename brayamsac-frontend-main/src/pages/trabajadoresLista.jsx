import { UserPlus, Search } from 'lucide-react'
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { ConfirmModal, Toast } from '@/components/ui'
import { MainLayout } from '@/components/layout'
import { TrabajadoresTableContainer, TrabajadorModal } from '@/components/features/trabajadores'
import { useTrabajadores } from '../hooks/useTrabajadores'
import { useUser } from '../hooks/useAuthUser'
import {
  crearTrabajador,
  editarTrabajador,
  toggleActivoTrabajador,
  eliminarTrabajador
} from '../services/trabajadoresservice.js'


const TrabajadoresLista = () => {
  const {
    trabajadores, setTrabajadores,
    loading,
    coordinadores,
    almacenes,
    subalmacenes
  } = useTrabajadores()
  const [showModal, setShowModal] = useState(false)
  const [trabajadorEditar, setTrabajadorEditar] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false);
  const [trabajadorAEliminar, setTrabajadorAEliminar] = useState(null);
  const [searchNombre, setSearchNombre] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate()
  const usuario = useUser()

  // Filtrar trabajadores por nombre
  const trabajadoresFiltrados = useMemo(() => {
    if (!searchNombre.trim()) {
      return trabajadores;
    }
    return trabajadores.filter(trabajador =>
      trabajador.nombre.toLowerCase().includes(searchNombre.toLowerCase())
    );
  }, [trabajadores, searchNombre]);

  // Agregar trabajador
  const handleAgregarTrabajador = async (nuevo) => {
    try {
      const token = localStorage.getItem('token');
      const body = {
        nombre: nuevo.nombre,
        dni: nuevo.dni,
        subalmacen_id: nuevo.subalmacen_id,
        coordinador_id: nuevo.coordinador_id,
        horas_objetivo: nuevo.horas_objetivo
      };
      const res = await crearTrabajador(body, token);
      if (!res.ok) {
        const error = await res.json();
        alert(`Error al agregar trabajador: ${  error.error || ''}`);
        return;
      }
      const trabajadorCreado = await res.json();
      const subalmacenObj = subalmacenes.find(s => s.id === Number(trabajadorCreado.subalmacen_id));
      const almacenId = subalmacenObj ? subalmacenObj.almacen_id : null;
      const trabajadorConAlmacen = {
        ...trabajadorCreado,
        almacen: almacenId,
        subalmacen: trabajadorCreado.subalmacen_id,
        coordinador: trabajadorCreado.coordinador_id
      };
      setTrabajadores(prev => [...prev, trabajadorConAlmacen]);
      setShowModal(false);
    } catch (error) {
      alert('Error de conexión con el backend');
      console.error('[Lista] Error en handleAgregarTrabajador:', error);
    }
  };

  // Editar trabajador
  const handleEditarTrabajador = async (editado) => {
    try {
      const token = localStorage.getItem('token');
      const body = {
        nombre: editado.nombre,
        dni: editado.dni,
        subalmacen_id: Number(editado.subalmacen_id || trabajadorEditar.subalmacen),
        coordinador_id: Number(editado.coordinador_id || trabajadorEditar.coordinador),
        horas_objetivo:
          editado.horas_objetivo !== "" && !isNaN(Number(editado.horas_objetivo))
            ? parseFloat(Number(editado.horas_objetivo).toFixed(2))
            : 0.0,
      };
      const res = await editarTrabajador(trabajadorEditar.id, body, token);
      if (!res.ok) {
        const error = await res.json();
        alert(`Error al editar trabajador: ${  error.error || ''}`);
        return;
      }
      setTrabajadores(prev =>
        prev.map(t =>
          t.id === trabajadorEditar.id
            ? { ...t, ...editado, subalmacen: Number(editado.subalmacen_id), coordinador: Number(editado.coordinador_id) }
            : t
        )
      );
      setShowModal(false);
      setTrabajadorEditar(null);
    } catch (error) {
      alert('Error de conexión con el backend');
      console.error('[Lista] Error en handleEditarTrabajador:', error);
    }
  };

  // Activar/desactivar trabajador
  const handleToggleActivo = async (id, activoActual) => {
    try {
      const token = localStorage.getItem('token');
      const nuevoEstado = activoActual === 1 ? 0 : 1;
      const res = await toggleActivoTrabajador(id, nuevoEstado, token);
      if (!res.ok) {
        const error = await res.json();
        alert(`Error al cambiar el estado: ${  error.error || ''}`);
        return;
      }
      setTrabajadores(prev =>
        prev.map(t =>
          t.id === id ? { ...t, activo: nuevoEstado } : t
        )
      );
    } catch (error) {
      alert('Error de conexión con el backend');
      console.error('[Lista] Error en handleToggleActivo:', error);
    }
  };

  const handleConfirmarEliminar = (id) => {
    setTrabajadorAEliminar(id);
    setShowConfirm(true);
  };

  const handleEliminarTrabajador = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await eliminarTrabajador(trabajadorAEliminar, token);
      if (!res.ok) {
        const error = await res.json();
        setToast({ 
          show: true, 
          message: `Error al eliminar trabajador: ${error.error || 'Error desconocido'}`, 
          type: 'error' 
        });
        setShowConfirm(false);
        setTrabajadorAEliminar(null);
        return;
      }
      setTrabajadores(prev => prev.filter(t => t.id !== trabajadorAEliminar));
      setToast({ 
        show: true, 
        message: 'Trabajador eliminado exitosamente', 
        type: 'success' 
      });
      setShowConfirm(false);
      setTrabajadorAEliminar(null);
    } catch (error) {
      console.error('Error eliminando trabajador:', error);
      setToast({ 
        show: true, 
        message: 'Error de conexión al eliminar trabajador', 
        type: 'error' 
      });
      setShowConfirm(false);
      setTrabajadorAEliminar(null);
    }
  };

  return (
    <MainLayout usuario={usuario}>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="space-y-6">
          {/* Encabezado con título y botón */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Lista de Trabajadores</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="border-2 border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                  placeholder="Buscar nombre"
                  value={searchNombre}
                  onChange={e => setSearchNombre(e.target.value)}
                  style={{ minWidth: 220 }}
                />
              </div>
              <button
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
                onClick={() => {
                  setTrabajadorEditar(null);
                  setShowModal(true);
                }}
              >
                <UserPlus size={20} />
                Agregar Trabajador
              </button>
            </div>
          </div>
          
          {/* Tabla de trabajadores */}
          <TrabajadoresTableContainer
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            loading={loading}
            trabajadores={trabajadoresFiltrados}
            almacenes={almacenes}
            subalmacenes={subalmacenes}
            coordinadores={coordinadores}
            onEdit={(trabajador) => {
              setTrabajadorEditar(trabajador);
              setShowModal(true);
            }}
            onToggleActivo={handleToggleActivo}
            onEliminar={handleConfirmarEliminar}
            navigate={navigate}
          />
        </div>
      </main>
      <TrabajadorModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setTrabajadorEditar(null);
        }}
        onSubmit={trabajadorEditar ? handleEditarTrabajador : handleAgregarTrabajador}
        coordinadores={coordinadores}
        trabajador={trabajadorEditar}
        almacenes={almacenes}
        subalmacenes={subalmacenes}
        trabajadores={trabajadores}
      />
      <ConfirmModal
        show={showConfirm}
        onConfirm={handleEliminarTrabajador}
        onCancel={() => {
          setShowConfirm(false);
          setTrabajadorAEliminar(null);
        }}
        title="Eliminar Trabajador"
        message="¿Está seguro de que desea eliminar este trabajador del sistema?"
        additionalComment="Esta acción eliminará todos los registros de asistencia y datos relacionados. No se puede deshacer."
      />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, show: false })}
      />
    </MainLayout>
  )
}

export default TrabajadoresLista