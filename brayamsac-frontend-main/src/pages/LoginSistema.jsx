import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import fondo from "../assets/img/inicio.jpg";
import logo from "../assets/img/logoinicio.png";
import { buildApiUrl, tokenManager, logger } from "../config/security.js";

export default function LoginSistema() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = tokenManager.get();
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña: password }),
      });

      const data = await response.json();
      logger.log("Respuesta del backend:", data);

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      const rol = data.usuario?.nombre_rol;
      const nombre = data.usuario?.nombre;
      const rolesPermitidos = ["RRHH", "ADMINISTRACION", 1, 2];

      if (rolesPermitidos.includes(rol)) {
        tokenManager.set(data.token);
        if (typeof Storage !== 'undefined') {
          localStorage.setItem("nombre", nombre);
          localStorage.setItem("rol", rol);
        }

        navigate("/dashboard");
      } else {
        setError("Acceso denegado: Solo RRHH o Administración pueden ingresar.");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-12 w-full max-w-md flex flex-col items-center">
        <img src={logo} alt="Logo BRAYAM" className="w-40 mb-7" />
        <h2 className="text-xl font-bold text-black mb-1">INGRESAR</h2>
        <p className="text-gray-700 mb-6 text-center text-sm">
          Ingreso de trabajadores de los almacenes de la empresa
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div>
            <label className="block font-semibold mb-1 text-black" htmlFor="correo">
              Usuario
            </label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 bg-transparent text-black"
              autoComplete="username"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-black" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 bg-transparent text-black"
              autoComplete="current-password"
              placeholder="Contraseña"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 rounded p-2 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#009ee3] text-white font-bold text-lg mt-2 hover:bg-[#007bbd] transition"
          >
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  );
}
