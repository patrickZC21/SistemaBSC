import { UserPlus, Search } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { buildApiUrl } from '../config/security.js';

import ConfirmModal from '@/components/ui/ConfirmModal';
import AsignarAlmacenesModal from '@/components/features/coordinadores/AsignarAlmacenesModal';
import CoordinadorAddModal from '@/components/features/coordinadores/CoordinadorAddModal';
import CoordinadorEditModal from '@/components/features/coordinadores/CoordinadorEditModal';
import CoordinadoresTable from '@/components/features/coordinadores/CoordinadoresTable';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import useCoordinadoresPage from '../hooks/useCoordinadoresPage';
import useAutoLogout from '../hooks/useAutoLogout';

export default function Coordinadores() {
  // Hook para gestión de sesión persistente (sin logout automático)
  useAutoLogout();
  
  const props = useCoordinadoresPage();
  const [searchNombre, setSearchNombre] = useState("");
  
  const {
    coordinadores,
    loading,
    error,
    handleUpdateCoordinador,
    usuario,
    showModal,
    setShowModal,
    form,
    handleAgregar,
    handleChange,
    loading: loading2,
    almacenesDisponibles,
    subalmacenesDisponibles,
    usuarioAlmacenes,
    editModal,
    setEditModal,
    editForm,
    setEditForm,
    usuarioIdAsignar,
    setUsuarioIdAsignar,
    showAsignarModal,
    setShowAsignarModal,
    coordinadorNombreAsignar,
    setCoordinadorNombreAsignar,
    handleAsignarAlmacenes,
    handleEliminar,
    confirmDeleteId,
    showConfirmModal,
    cancelarEliminar,
    confirmarEliminar,
    subalmacenesFiltrados,
  } = props;

  // Filtrar coordinadores por nombre
  const coordinadoresFiltrados = useMemo(() => {
    if (!searchNombre.trim()) {
      return coordinadores;
    }
    return coordinadores.filter(coordinador =>
      coordinador.nombre.toLowerCase().includes(searchNombre.toLowerCase())
    );
  }, [coordinadores, searchNombre]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header usuario={usuario} />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Lista de Coordinadores</h2>
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
                className="flex items-center gap-2 bg-[#19202A] text-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-[#232b39] transition cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <UserPlus size={20} />
                Agregar Coordinador
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <CoordinadoresTable
              coordinadores={coordinadoresFiltrados}
              usuarioAlmacenes={usuarioAlmacenes}
              onEdit={(coordinador) => {
                setEditForm(coordinador);
                setEditModal(true);
              }}
              onDelete={handleEliminar}
              onView={async (coordinador) => {
                // Cambiar el estado activo/inactivo
                const nuevoEstado = coordinador.activo === 1 ? 0 : 1;
                await handleUpdateCoordinador(coordinador.id, { ...coordinador, activo: nuevoEstado });
                // Opcional: recargar datos si no se actualiza automáticamente
                if (typeof props.refetchCoordinadores === 'function') {
                  await props.refetchCoordinadores();
                }
              }}
            />
          </div>
          {showModal && (
            <CoordinadorAddModal
              showModal={showModal}
              setShowModal={setShowModal}
              handleAgregar={handleAgregar}
              form={form}
              handleChange={handleChange}
              loading={loading2}
            />
          )}
          {showAsignarModal && (
            <div>
              <div className="mb-4 text-center">
                <div className="font-bold text-lg">Coordinador: {coordinadorNombreAsignar}</div>
                <div className="text-sm text-gray-600">Rol: Coordinador</div>
              </div>
              <AsignarAlmacenesModal
                showModal={showAsignarModal}
                setShowModal={setShowAsignarModal}
                usuarioId={usuarioIdAsignar}
                coordinadorNombre={coordinadorNombreAsignar}
                almacenesDisponibles={almacenesDisponibles}
                subalmacenesDisponibles={subalmacenesDisponibles}
                onAsignar={handleAsignarAlmacenes}
                loading={loading2}
              />
            </div>
          )}
          {editModal && (
            <CoordinadorEditModal
              isOpen={editModal}
              onClose={() => setEditModal(false)}
              coordinador={editForm}
              almacenesDisponibles={almacenesDisponibles}
              subalmacenesDisponibles={subalmacenesDisponibles}
              asignacionesActuales={(() => {
                const asignaciones = usuarioAlmacenes.filter(
                  (ua) => Number(ua.usuario_id) === Number(editForm.id)
                );
                const almacenId = asignaciones.length > 0 ? asignaciones[0].almacen_id : '';
                const subalmacenIds = asignaciones.map((ua) => String(ua.subalmacen_id));
                const limite = asignaciones.length > 0 ? (asignaciones[0].limite_ingresos || 1) : 1;
                return { almacenId, subalmacenIds, limite };
              })()}
              onSave={async (data) => {
                // Validación: debe seleccionar almacén y al menos un subalmacén
                if (!data.almacenId) {
                  alert('Debes seleccionar un almacén.');
                  return;
                }
                if (!data.subalmacenIds || data.subalmacenIds.length === 0) {
                  alert('Debes seleccionar al menos un subalmacén.');
                  return;
                }
                await handleUpdateCoordinador(data.id, data);
                if (data.almacenId && data.subalmacenIds && data.subalmacenIds.length > 0) {
                  // Eliminar todas las asignaciones actuales antes de asignar las nuevas
                  await fetch(buildApiUrl(`/api/usuario-almacenes/usuario/${data.id}`), {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                  });
                  const almacenes = data.subalmacenIds.map((subalmacen_id) => ({
                    subalmacen_id: Number(subalmacen_id),
                    limite_ingresos: Number(data.limite) || 1,
                  }));
                  await props.handleAsignarAlmacenes({ usuario_id: data.id, almacenes });
                }
                const res = await fetch(buildApiUrl('/api/usuario-almacenes'), {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (res.ok && typeof props.setUsuarioAlmacenes === 'function') {
                  const data = await res.json();
                  props.setUsuarioAlmacenes(data);
                }
                setEditModal(false);
                setEditForm({ id: null, nombre: '', correo: '', password: '' });
              }}
              mostrarLimiteIngresos={true}
            />
          )}
          {showConfirmModal && (
            <ConfirmModal
              show={showConfirmModal}
              onCancel={cancelarEliminar}
              onConfirm={confirmarEliminar}
              title="Eliminar Coordinador"
              message="¿Estás seguro que deseas eliminar este coordinador?"
              additionalComment="⚠️ Esta acción eliminará permanentemente el coordinador y todas sus asignaciones de almacenes. Esta acción no se puede recuperar."
            />
          )}
        </main>
      </div>
    </div>
  );
}
