import { useState } from 'react';
import { deleteAlmacen } from '../services/almacen.service.js';
import { tokenManager } from '../config/security.js';

export function useDeleteAlmacen(onAlmacenDeleted) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteNombre, setDeleteNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = (almacen) => {
    setDeleteId(almacen.id);
    setDeleteNombre(almacen.nombre);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const token = tokenManager.get();
      await deleteAlmacen(token, deleteId);
      
      // Llamar callback para actualizar la lista
      if (onAlmacenDeleted) {
        onAlmacenDeleted(deleteId);
      }
      
      alert('✅ Almacén eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar almacén:', error);
      
      if (error.message.includes('No se puede eliminar')) {
        alert(`❌ ${error.message}`);
      } else if (error.message.includes('404')) {
        alert('❌ El almacén no existe o ya fue eliminado');
      } else {
        alert('❌ Error al eliminar el almacén. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setDeleteId(null);
      setDeleteNombre('');
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
    setDeleteNombre('');
  };

  return {
    showConfirm,
    deleteNombre,
    loading,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
