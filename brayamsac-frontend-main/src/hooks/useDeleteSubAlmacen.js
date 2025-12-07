import { useState } from 'react';

export function useDeleteSubAlmacen(handleDeleteSubAlmacen) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await handleDeleteSubAlmacen(deleteId);
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  return {
    showConfirm,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}