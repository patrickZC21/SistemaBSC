import { useState, useEffect } from 'react';

export function useTrabajadorForm(trabajador) {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [almacen, setAlmacen] = useState('');
  const [subalmacen, setSubalmacen] = useState('');
  const [coordinador, setCoordinador] = useState('');

  useEffect(() => {
    if (trabajador) {
      setNombre(trabajador.nombre || '');
      setDni(trabajador.dni || '');
      setAlmacen(trabajador.almacen ? String(trabajador.almacen) : '');
      setSubalmacen(trabajador.subalmacen ? String(trabajador.subalmacen) : '');
      setCoordinador(trabajador.coordinador ? String(trabajador.coordinador) : '');
    } else {
      setNombre('');
      setDni('');
      setAlmacen('');
      setSubalmacen('');
      setCoordinador('');
    }
  }, [trabajador]);

  return {
    nombre, setNombre,
    dni, setDni,
    almacen, setAlmacen,
    subalmacen, setSubalmacen,
    coordinador, setCoordinador
  };
}