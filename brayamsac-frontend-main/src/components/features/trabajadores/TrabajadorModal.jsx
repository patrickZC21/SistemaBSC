import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function TrabajadorModal({ visible, onClose, onSubmit, coordinadores, trabajador, almacenes, subalmacenes, trabajadores }) {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [almacen, setAlmacen] = useState(trabajador?.almacen || "");
  const [subalmacen, setSubalmacen] = useState(trabajador?.subalmacen || "");
  const [coordinador, setCoordinador] = useState('');
  const [horas_objetivo, setHorasObjetivo] = useState('');

  useEffect(() => {
    if (trabajador) {
      setAlmacen(trabajador.almacen || "");
      setSubalmacen(trabajador.subalmacen || "");
      setNombre(trabajador.nombre || '');
      setDni(trabajador.dni || '');
      setCoordinador(trabajador.coordinador ? String(trabajador.coordinador) : '');
      setHorasObjetivo(trabajador.horas_objetivo || '');
    } else {
      setNombre('');
      setDni('');
      setAlmacen('');
      setSubalmacen('');
      setCoordinador('');
      setHorasObjetivo('');
    }
  }, [trabajador]);

  const subalmacenesDisponibles = subalmacenes.filter(s => s.almacen_id === Number(almacen));
  const coordinadoresDisponibles = coordinadores;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar que el DNI no esté repetido (excepto el propio trabajador)
    const dniRepetido = trabajadores.some(
      t => t.dni === dni && (!trabajador || String(t.id) !== String(trabajador.id))
    );
    if (dniRepetido) {
      alert('Ya existe un trabajador con ese DNI.');
      return;
    }
    onSubmit({
      nombre,
      dni,
      almacen: almacen || trabajador?.almacen,
      subalmacen_id: subalmacen || trabajador?.subalmacen,
      coordinador_id: coordinador ? Number(coordinador) : null,
      horas_objetivo:
        horas_objetivo !== "" && !isNaN(Number(horas_objetivo))
          ? parseFloat(Number(horas_objetivo).toFixed(2))
          : 0.0,
    });
    console.log({ nombre, dni, subalmacen_id: subalmacen, coordinador_id: coordinador, horas_objetivo });
    setNombre('');
    setDni('');
    setAlmacen('');
    setSubalmacen('');
    setCoordinador('');
    setHorasObjetivo('');
  };

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
      // ...resto del código...
    } catch (error) {
      alert('Error de conexión con el backend');
      console.error('[Lista] Error en handleAgregarTrabajador:', error);
    }
  };

  const handleEditarTrabajador = async (editado) => {
    try {
      const token = localStorage.getItem('token');
      const body = {
        nombre: editado.nombre,
        dni: editado.dni,
        subalmacen_id: editado.subalmacen_id ? Number(editado.subalmacen_id) : null,
        coordinador_id: editado.coordinador_id ? Number(editado.coordinador_id) : null,
        horas_objetivo: editado.horas_objetivo !== undefined && editado.horas_objetivo !== ''
          ? parseFloat(Number(editado.horas_objetivo).toFixed(2))
          : 0.00
      };
      const res = await editarTrabajador(editado.id, body, token);
      if (!res.ok) {
        const error = await res.json();
        alert(`Error al editar trabajador: ${  error.error || ''}`);
        return;
      }
      // Actualiza la lista de trabajadores según tu lógica
      setShowModal(false);
    } catch (error) {
      alert('Error de conexión con el backend');
      console.error('[Modal] Error en handleEditarTrabajador:', error);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[600px] max-w-[800px] w-full mx-4 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          <X size={28} />
        </button>
        <h2 className="text-xl font-semibold mb-4">{trabajador ? 'Editar Trabajador' : 'Agregar Trabajador'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">DNI</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={dni}
              onChange={e => setDni(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Almacén</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={almacen}
              onChange={e => {
                setAlmacen(e.target.value);
                setSubalmacen(''); // Limpiar subalmacén al cambiar almacén
              }}
              required
            >
              <option value="">Selecciona un almacén</option>
              {almacenes.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Subalmacén</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={subalmacen}
              onChange={e => setSubalmacen(e.target.value)}
              required
              disabled={!almacen}
            >
              <option value="">Selecciona un subalmacén</option>
              {subalmacenes
                .filter(s => String(s.almacen_id) === String(almacen))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Coordinador</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={coordinador}
              onChange={e => setCoordinador(e.target.value)}
              required
            >
              <option value="">Selecciona un coordinador</option>
              {coordinadores.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Horas Objetivo</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border rounded px-3 py-2"
              value={horas_objetivo}
              onChange={e => setHorasObjetivo(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}