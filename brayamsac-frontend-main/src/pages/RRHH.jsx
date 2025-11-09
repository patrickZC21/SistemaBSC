import { UserPlus, Search } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { ConfirmModal, Toast } from '@/components/ui';
import { MainLayout } from '@/components/layout';
import { RRHHAddModal, RRHHEditModal, RRHHTable } from '@/components/features/rrhh';
import useRRHHPage from '../hooks/useRRHHPage';
import useAutoLogout from '../hooks/useAutoLogout';

export default function RRHH() {
  // Hook para gestión de sesión persistente (sin logout automático)
  useAutoLogout();
  
  const props = useRRHHPage();
  const [searchNombre, setSearchNombre] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const {
    rrhh,
    loading,
    error,
    handleUpdateRRHH,
    usuario,
    showModal,
    setShowModal,
    form,
    handleAgregar,
    handleChange,
    loading: loading2,
    editModal,
    setEditModal,
    editForm,
    setEditForm,
    handleEliminar,
    confirmDeleteId,
    showConfirmModal,
    cancelarEliminar,
    confirmarEliminar,
  } = props;

  // Wrapper para confirmarEliminar con toast
  const confirmarEliminarConToast = async () => {
    try {
      await confirmarEliminar();
      setToast({ 
        show: true, 
        message: 'Usuario RRHH eliminado exitosamente', 
        type: 'success' 
      });
    } catch (error) {
      setToast({ 
        show: true, 
        message: 'Error al eliminar usuario RRHH', 
        type: 'error' 
      });
    }
  };

  // Filtrar RRHH por nombre
  const rrhhFiltrados = useMemo(() => {
    if (!searchNombre.trim()) {
      return rrhh;
    }
    return rrhh.filter(persona =>
      persona.nombre.toLowerCase().includes(searchNombre.toLowerCase())
    );
  }, [rrhh, searchNombre]);

  return (
    <MainLayout usuario={usuario}>
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Lista de RRHH</h2>
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
              Agregar RRHH
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <RRHHTable
            rrhh={rrhhFiltrados}
            onEdit={(persona) => {
              setEditForm(persona);
              setEditModal(true);
            }}
            onDelete={handleEliminar}
            onView={async (persona) => {
              // Cambiar el estado activo/inactivo
              const nuevoEstado = persona.activo === 1 ? 0 : 1;
              await handleUpdateRRHH(persona.id, {
                ...persona,
                activo: nuevoEstado
              });
            }}
          />
        </div>
        
        {/* Modales */}
        <RRHHAddModal
          show={showModal}
          setShow={setShowModal}
          form={form}
          handleChange={handleChange}
          handleAgregar={handleAgregar}
          loading={loading2}
        />
        
        <RRHHEditModal
          show={editModal}
          setShow={setEditModal}
          form={editForm}
          setForm={setEditForm}
          onUpdate={handleUpdateRRHH}
        />
        
        <ConfirmModal
          show={showConfirmModal}
          title="Eliminar Usuario RRHH"
          message="¿Está seguro de que desea eliminar este usuario del sistema?"
          additionalComment="Se eliminará permanentemente el acceso y todos los datos relacionados. Esta acción no se puede deshacer."
          onConfirm={confirmarEliminarConToast}
          onCancel={cancelarEliminar}
        />
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, show: false })}
        />
      </main>
    </MainLayout>
  );
}
