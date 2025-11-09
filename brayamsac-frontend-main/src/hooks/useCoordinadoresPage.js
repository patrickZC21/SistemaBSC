import { useEffect, useState, useCallback } from 'react';

import useCoordinadores from '../hooks/useCoordinadores';
import { fetchAlmacenes, fetchSubalmacenes, asignarAlmacenesUsuario } from '../services/coordinadoresService.js';
import { buildApiUrl } from '../config/security.js';

export default function useCoordinadoresPage() {
  const {
    coordinadores,
    loading,
    error,
    handleUpdateCoordinador,
    handleDeleteCoordinador,
    refetchCoordinadores,
  } = useCoordinadores();

  const [usuario, setUsuario] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', almacen_id: '', subalmacen_id: '', limite_ingresos: '' });
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, nombre: '', correo: '', password: '' });
  const [almacenesDisponibles, setAlmacenesDisponibles] = useState([]);
  const [subalmacenesDisponibles, setSubalmacenesDisponibles] = useState([]);
  const [usuarioAlmacenes, setUsuarioAlmacenes] = useState([]);
  const [usuarioIdAsignar, setUsuarioIdAsignar] = useState(null);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [coordinadorNombreAsignar, setCoordinadorNombreAsignar] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar datos en paralelo solo si no están ya cargados
      const promises = [];
      
      if (almacenesDisponibles.length === 0) {
        promises.push(fetchAlmacenes());
      }
      if (subalmacenesDisponibles.length === 0) {
        promises.push(fetchSubalmacenes());
      }
      
      // Siempre recargar usuarioAlmacenes ya que puede cambiar
      promises.push(
        fetch(buildApiUrl('/api/usuario-almacenes'), {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      
      const results = await Promise.all(promises);
      
      // Actualizar solo lo que se cargó
      let resultIndex = 0;
      if (almacenesDisponibles.length === 0) {
        setAlmacenesDisponibles(results[resultIndex]);
        resultIndex++;
      }
      if (subalmacenesDisponibles.length === 0) {
        setSubalmacenesDisponibles(results[resultIndex]);
        resultIndex++;
      }
      
      // Siempre actualizar usuarioAlmacenes
      const usuarioAlmacenesRes = results[resultIndex];
      if (usuarioAlmacenesRes.ok) {
        const data = await usuarioAlmacenesRes.json();
        setUsuarioAlmacenes(data);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    }
  }, [almacenesDisponibles.length, subalmacenesDisponibles.length]);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    const nombre_rol = localStorage.getItem('rol');
    setUsuario({ nombre, nombre_rol });
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAlmacenChange = (e) => {
    setForm((f) => ({ ...f, almacen_id: e.target.value, subalmacen_id: '', limite_ingresos: '' }));
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const usuarioRes = await fetch(buildApiUrl('/api/usuarios'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          correo: form.correo,
          password: form.password,
          rol_id: 3,
        }),
      });
      if (!usuarioRes.ok) {
        const error = await usuarioRes.json();
        alert(error.detalle || 'Error al crear usuario');
        return;
      }
      const usuarioCreado = await usuarioRes.json();
      setShowModal(false);
      setForm({ nombre: '', correo: '', password: '', almacen_id: '', subalmacen_id: [], limite_ingresos: '' });
      
      // Solo recargar coordinadores (más rápido)
      await refetchCoordinadores();
      
      // Abrir modal de asignación
      setTimeout(() => {
        const usuarioId = usuarioCreado.usuario?.id;
        setUsuarioIdAsignar(usuarioId);
        setCoordinadorNombreAsignar(usuarioCreado.usuario?.nombre || form.nombre);
        setShowAsignarModal(true);
      }, 100); // Reducido de 300ms a 100ms
      
    } catch (err) {
      alert(err.message || 'Error al agregar coordinador');
      console.error('[Coordinadores] Error al agregar:', err);
    }
  };

  const handleAsignarAlmacenes = async ({ usuario_id, almacenes }) => {
    if (!usuario_id) {
      alert('Error: No se ha seleccionado un usuario válido para asignar almacenes.');
      return;
    }
    if (!almacenes || almacenes.length === 0) {
      alert('Error: Debe seleccionar al menos un almacén/subalmacén.');
      return;
    }
    
    try {
      await asignarAlmacenesUsuario({ usuario_id, almacenes });
      
      setShowAsignarModal(false);
      setUsuarioIdAsignar(null);
      setCoordinadorNombreAsignar('');
      
      // Solo recargar los datos esenciales (más rápido)
      await refetchCoordinadores();
      
    } catch (err) {
      console.error('❌ Error asignando almacenes:', err);
      
      // Manejo específico de errores
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        alert('❌ Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else if (err.message.includes('404')) {
        alert('❌ Error: El servicio de asignación de almacenes no está disponible.');
      } else if (err.message.includes('401')) {
        alert('❌ Error de autenticación: Tu sesión ha expirado. Serás redirigido al login.');
        localStorage.removeItem('token');
        window.location.href = '/loginSistema';
      } else if (err.message.includes('400')) {
        alert('❌ Error en los datos: Verifica que todos los campos estén correctos.');
      } else {
        alert(`❌ Error al asignar almacenes: ${err.message}`);
      }
    }
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    await handleUpdateCoordinador(editForm.id, editForm);
    setEditModal(false);
  };

  const handleEliminar = async (id) => {
    setConfirmDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmarEliminar = async () => {
    if (!confirmDeleteId) return;
    
    const token = localStorage.getItem('token');
    
    try {
      // 1. Eliminar asignaciones de almacenes (solo si existen)
      const resUA = await fetch(buildApiUrl(`/api/usuario-almacenes/usuario/${confirmDeleteId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Ignorar 404 (no hay asignaciones)
      if (!resUA.ok && resUA.status !== 404) {
        throw new Error('Error eliminando asignaciones de almacén');
      }
      
      // 2. Eliminar usuario coordinador
      await handleDeleteCoordinador(confirmDeleteId);
      
      // 3. Solo recargar coordinadores (más rápido que recargar todo)
      await refetchCoordinadores();
      
    } catch (err) {
      console.error('[Coordinadores] Error al eliminar:', err);
      
      if (err.message?.includes('404')) {
        alert('⚠️ El coordinador ya no existe en el sistema');
      } else {
        alert('❌ Error al eliminar el coordinador. Por favor, intenta nuevamente.');
      }
      
      // Recargar datos en caso de error para sincronizar
      try {
        await refetchCoordinadores();
      } catch (reloadErr) {
        console.error('[Coordinadores] Error recargando después del error:', reloadErr);
      }
    } finally {
      // Cerrar el modal de confirmación
      setConfirmDeleteId(null);
      setShowConfirmModal(false);
    }
  };

  const cancelarEliminar = () => {
    setConfirmDeleteId(null);
    setShowConfirmModal(false);
  };

  const subalmacenesFiltrados = subalmacenesDisponibles.filter(
    (sa) => String(sa.almacen_id) === String(form.almacen_id)
  );

  return {
    coordinadores,
    loading,
    error,
    handleUpdateCoordinador,
    handleDeleteCoordinador,
    usuario,
    showModal,
    setShowModal,
    form,
    setForm,
    editModal,
    setEditModal,
    editForm,
    setEditForm,
    almacenesDisponibles,
    subalmacenesDisponibles,
    usuarioAlmacenes,
    usuarioIdAsignar,
    setUsuarioIdAsignar,
    showAsignarModal,
    setShowAsignarModal,
    coordinadorNombreAsignar,
    setCoordinadorNombreAsignar,
    confirmDeleteId,
    setConfirmDeleteId,
    showConfirmModal,
    setShowConfirmModal,
    loadData,
    handleChange,
    handleAlmacenChange,
    handleAgregar,
    handleAsignarAlmacenes,
    handleGuardarEdicion,
    handleEliminar,
    confirmarEliminar,
    cancelarEliminar,
    subalmacenesFiltrados,
  };
}
