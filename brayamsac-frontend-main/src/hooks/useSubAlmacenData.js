import { useState, useEffect, useRef } from 'react';

import { buildApiUrl, tokenManager, logger } from '../config/security.js';

export function useSubAlmacenData(id, navigate) {
  const [subalmacenes, setSubalmacenes] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [nombreAlmacen, setNombreAlmacen] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editRefrigerio, setEditRefrigerio] = useState('');
  const [editJornada, setEditJornada] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nuevoSub, setNuevoSub] = useState({ nombre: '', refrigerio: '', jornada: '' });
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setUsuario(data.usuario);
      } catch (err) {
        tokenManager.remove();
        navigate('/');
      }
    };

    const fetchSubalmacenes = async () => {
      setLoading(true);
      setSubalmacenes([]);
      try {
        const token = tokenManager.get();
        logger.log('Obteniendo subalmacenes para almacén ID:', id);
        
        const res = await fetch(buildApiUrl('/api/subalmacenes'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error('Error al cargar subalmacenes');
        
        const all = await res.json();
        logger.log('Subalmacenes obtenidos:', all);
        
        const filtered = all.filter(sa => sa.almacen_id === Number(id));
        logger.log('Subalmacenes filtrados para almacén', id, ':', filtered);
        
        setSubalmacenes(filtered);
      } catch (err) {
        logger.error('Error al obtener subalmacenes:', err);
        setSubalmacenes([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchAlmacen = async () => {
      try {
        const token = tokenManager.get();
        const res = await fetch(buildApiUrl(`/api/almacenes/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          logger.log('Datos del almacén obtenidos:', data);
          setNombreAlmacen(data.nombre || '');
        } else {
          logger.warn('No se pudo obtener el almacén');
          setNombreAlmacen('');
        }
      } catch (error) {
        logger.error('Error al obtener almacén:', error);
        setNombreAlmacen('');
      }
    };

    const fetchAlmacenes = async () => {
      try {
        const token = tokenManager.get();
        const res = await fetch(buildApiUrl('/api/almacenes'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAlmacenes(data);
        }
      } catch (error) {
        logger.error('Error al obtener almacenes:', error);
        setAlmacenes([]);
      }
    };

    validarTokenYUsuario();
    fetchSubalmacenes();
    fetchAlmacen();
    fetchAlmacenes();
  }, [id, navigate]);

  // Funciones de edición y modal
  const handleEdit = (sub) => {
    setEditId(sub.id);
    setEditNombre(sub.nombre);
    setEditRefrigerio(sub.refrigerio || '');
    setEditJornada(sub.jornada || '');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditNombre('');
    setEditRefrigerio('');
    setEditJornada('');
  };

  const handleSaveEdit = async (sub) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/subalmacenes/${sub.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: editNombre,
          almacen_id: sub.almacen_id,
          refrigerio: editRefrigerio,
          jornada: editJornada
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`Error al editar subalmacén: ${  errorText}`);
        return;
      }

      setSubalmacenes((prev) =>
        prev.map((s) =>
          s.id === sub.id ? { ...s, nombre: editNombre, refrigerio: editRefrigerio, jornada: editJornada } : s
        )
      );
      setEditId(null);
      setEditNombre('');
      setEditRefrigerio('');
      setEditJornada('');
    } catch (err) {
      alert('Error al editar subalmacén');
    }
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChangeNuevoSub = (e) => {
    setNuevoSub({ ...nuevoSub, [e.target.name]: e.target.value });
  };

  const handleSubmitNuevoSub = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl('/api/subalmacenes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` ,
        },
        body: JSON.stringify({
          nombre: nuevoSub.nombre,
          almacen_id: Number(id),
          refrigerio: nuevoSub.refrigerio,
          jornada: nuevoSub.jornada
        }),
      });
      if (!res.ok) throw new Error('Error al crear subalmacén');
      setShowModal(false);
      setNuevoSub({ nombre: '', refrigerio: '', jornada: '' });
      // Recargar subalmacenes
      const subRes = await fetch(buildApiUrl('/api/subalmacenes'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = await subRes.json();
      setSubalmacenes(all.filter(sa => sa.almacen_id === Number(id)));
    } catch (err) {
      alert('Error al crear subalmacén');
    }
  };

  // Agrega esta función dentro del hook
  const handleDeleteSubAlmacen = async (subalmacenId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/subalmacenes/${subalmacenId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al eliminar subalmacén');
      // Actualiza la lista local después de eliminar
      setSubalmacenes((prev) => prev.filter((s) => s.id !== subalmacenId));
    } catch (err) {
      alert('Error al eliminar subalmacén');
    }
  };

  return {
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
    setNuevoSub,
    setShowModal,
    setSubalmacenes,
    handleDeleteSubAlmacen, // <-- Agrega esto al return
  };
}