import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { AgregarSubAlmacenButton } from '@/components/shared';
import { 
  AlmacenDropdown, 
  BotonAgregarFechas, 
  FechasHeader, 
  FechasPorSubalmacen, 
  SubAlmacenHeader, 
  SubAlmacenModal, 
  SubAlmacenTable 
} from '@/components/features/almacenes';
import { ConfirmModal, Notificacion } from '@/components/ui';
import { MainLayout } from '@/components/layout';
import { useDeleteSubAlmacen } from '../hooks/useDeleteSubAlmacen';
import { useSubAlmacenData } from '../hooks/useSubAlmacenData';

const SubAlmacen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noti, setNoti] = useState(null);

  const {
    subalmacenes,
    almacenes,
    loading,
    usuario,
    nombreAlmacen,
    dropdownOpen,
    setDropdownOpen,
    editId,
    editNombre,
    editRefrigerio,
    editJornada,
    setEditNombre,
    setEditRefrigerio,
    setEditJornada,
    showModal,
    nuevoSub,
    dropdownRef,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleOpenModal,
    handleCloseModal,
    handleChangeNuevoSub,
    handleSubmitNuevoSub,
    handleDeleteSubAlmacen, // asegúrate de exponer esto en tu hook
  } = useSubAlmacenData(id, navigate);
  // Sobreescribir el método para mostrar notificación en vez de alert
  const mostrarError = (mensaje) => setNoti(mensaje);

  const {
    showConfirm,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDeleteSubAlmacen(handleDeleteSubAlmacen);

  return (
    <MainLayout usuario={usuario}>
      <main className="flex-1 p-6 relative">
        <Notificacion mensaje={noti} tipo="error" onClose={() => setNoti(null)} />
        <div className="flex justify-between items-center mb-4">
          <SubAlmacenHeader nombreAlmacen={nombreAlmacen} />
          <AgregarSubAlmacenButton onClick={handleOpenModal} />
        </div>
        <SubAlmacenModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmitNuevoSub}
          nuevoSub={nuevoSub}
          onChange={handleChangeNuevoSub}
        />
        <div className="mb-4">
          <AlmacenDropdown
            nombreAlmacen={nombreAlmacen}
            dropdownRef={dropdownRef}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            almacenes={almacenes}
            id={id}
            navigate={navigate}
          />
        </div>
        <SubAlmacenTable
          subalmacenes={subalmacenes}
          editId={editId}
          editNombre={editNombre}
          editRefrigerio={editRefrigerio}
          editJornada={editJornada}
          setEditNombre={setEditNombre}
          setEditRefrigerio={setEditRefrigerio}
          setEditJornada={setEditJornada}
          handleEdit={handleEdit}
          handleCancelEdit={handleCancelEdit}
          handleSaveEdit={handleSaveEdit}
          navigate={navigate}
          onDelete={handleDeleteClick}
        />
        <ConfirmModal
          show={showConfirm}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          mensaje="¿Estás seguro que deseas eliminar este subalmacén? Esta acción no se puede deshacer."
        />
      </main>
    </MainLayout>
  );
};

export default SubAlmacen;
// Para que la notificación funcione, debes modificar el hook useSubAlmacenData.js y reemplazar los alert por mostrarError