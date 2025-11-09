import { Plus, X, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ConfirmDeleteModal from '@/components/features/almacenes/ConfirmDeleteModal';
import { buildApiUrl, tokenManager, logger } from '../config/security.js';
import { getAlmacenes, postAlmacen } from '../services/almacen.service.js';
import { useDeleteAlmacen } from '../hooks/useDeleteAlmacen';


const Almacenes = () => {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subalmacen, setSubalmacen] = useState({ nombre: '', descripcion: '' });
  const navigate = useNavigate();

  // Hook para manejar eliminación de almacenes
  const {
    showConfirm,
    deleteNombre,
    loading: deleteLoading,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDeleteAlmacen((deletedId) => {
    // Callback para actualizar la lista después de eliminar
    setAlmacenes(prev => prev.filter(almacen => almacen.id !== deletedId));
  });

  useEffect(() => {
    const validarTokenYUsuario = async () => {
      const token = tokenManager.get();
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const res = await fetch(buildApiUrl('/api/auth/validar'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Token inválido');
        const data = await res.json();
        setUsuario(data.usuario); // Aquí sí existe "data"
      } catch (err) {
        tokenManager.remove();
        navigate('/');
      }
    };

    validarTokenYUsuario();

    // Obtener almacenes
    const fetchAlmacenes = async () => {
      try {
        const token = tokenManager.get();
        const response = await getAlmacenes(token);
        setAlmacenes(response);
        logger.log("Almacenes recibidos:", response);
      } catch (error) {
        logger.error('Error al obtener almacenes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlmacenes();
  }, [navigate]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    setSubalmacen({ ...subalmacen, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = tokenManager.get();
      await postAlmacen(token, subalmacen);
      const response = await getAlmacenes(token);
      setAlmacenes(response);
      setShowModal(false);
      setSubalmacen({ nombre: '', descripcion: '' });
    } catch (error) {
      alert('Error al crear almacén');
      logger.error('Error al crear almacén:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header usuario={usuario} />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Almacenes</h1>
            <button
              type="button"
              onClick={handleOpenModal}
              className="cursor-pointer text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            >
              + Agregar Almacén
            </button>
          </div>
          {/* Modal */}
          {showModal && (
           <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">

              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={handleCloseModal}
                >
                  <X />
                </button>
                <h2 className="text-xl font-semibold mb-4">Agregar Almacén</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={subalmacen.nombre}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      value={subalmacen.descripcion}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border rounded text-gray-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {loading ? (
            <p>Cargando almacenes...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {almacenes.map((almacen) => (
                <div
                  key={almacen.id}
                  className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center transition hover:bg-gray-50 relative group"
                >
                  {/* Botón de eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(almacen);
                    }}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                    title="Eliminar almacén"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Contenido del almacén (clickeable) */}
                  <div
                    className="text-center cursor-pointer flex-1 w-full flex flex-col items-center justify-center"
                    onClick={() => navigate(`/almacenes/${almacen.id}`)}
                  >
                    <div className="text-4xl">🏢</div>
                    <h2 className="font-semibold text-lg mt-2">{almacen.nombre}</h2>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de confirmación de eliminación */}
          <ConfirmDeleteModal
            show={showConfirm}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            almacenNombre={deleteNombre}
            loading={deleteLoading}
          />
        </main>
      </div>
    </div>
  );
};

export default Almacenes;
