import { useState, useEffect } from 'react';

import { buildApiUrl, tokenManager, logger } from '../config/security.js';

export default function useRRHHPage() {
  const [rrhh, setRRHH] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol_id: 1, // ID del rol RRHH
    activo: 1,
    ya_ingreso: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarRRHH();
    cargarUsuario();
  }, []);

  const cargarRRHH = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl('/api/usuarios');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenManager.get()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al cargar usuarios RRHH');
      
      const data = await response.json();
      logger.log('Todos los usuarios obtenidos:', data);
      logger.log('Tipos de datos de rol_id:', data.map(u => ({nombre: u.nombre, rol_id: u.rol_id, tipo: typeof u.rol_id})));
      
      // Filtrar solo usuarios con rol RRHH (ID: 1) - aceptar rol_id o rol
      const rrhhFiltrados = data.filter(usuario => {
        const rolId = usuario.rol_id ?? usuario.rol;
        if (rolId === undefined) {
          logger.warn(`Usuario ${usuario.nombre}: No tiene campo rol_id ni rol.`, usuario);
          return false;
        }
        const esRRHH = rolId === 1 || rolId === "1";
        logger.log(`Usuario ${usuario.nombre}: rol_id/rol=${rolId} (${typeof rolId}), esRRHH=${esRRHH}`);
        return esRRHH;
      });
      logger.log('Usuarios RRHH filtrados:', rrhhFiltrados);
      setRRHH(rrhhFiltrados);
    } catch (error) {
      logger.error('Error al cargar RRHH:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuario = () => {
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    setUsuario({ nombre, rol });
  };

  const handleAgregar = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl('/api/usuarios');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenManager.get()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error('Error al crear usuario RRHH');
      
      await cargarRRHH();
      setShowModal(false);
      setForm({
        nombre: '',
        correo: '',
        password: '',
        rol_id: 1,
        activo: 1,
        ya_ingreso: 0
      });
      logger.log('Usuario RRHH creado exitosamente');
    } catch (error) {
      logger.error('Error al crear RRHH:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRRHH = async (id, data) => {
    try {
      const url = buildApiUrl(`/api/usuarios/${id}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenManager.get()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al actualizar usuario RRHH');
      
      await cargarRRHH();
      setEditModal(false);
      logger.log('Usuario RRHH actualizado exitosamente');
    } catch (error) {
      logger.error('Error al actualizar RRHH:', error);
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEliminar = (id) => {
    setConfirmDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      const url = buildApiUrl(`/api/usuarios/${confirmDeleteId}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenManager.get()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al eliminar usuario RRHH');
      
      await cargarRRHH();
      setShowConfirmModal(false);
      setConfirmDeleteId(null);
      logger.log('Usuario RRHH eliminado exitosamente');
    } catch (error) {
      logger.error('Error al eliminar RRHH:', error);
      setError(error.message);
    }
  };

  const cancelarEliminar = () => {
    setShowConfirmModal(false);
    setConfirmDeleteId(null);
  };

  return {
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
    editModal,
    setEditModal,
    editForm,
    setEditForm,
    handleEliminar,
    confirmDeleteId,
    showConfirmModal,
    cancelarEliminar,
    confirmarEliminar
  };
}
