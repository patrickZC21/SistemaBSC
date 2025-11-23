import { useNavigate } from "react-router-dom";
import { logger } from '../config/app-security.js';

export default function SubalmacenCard({ nombre, id }) {
  const navigate = useNavigate();
  // Debug: mostrar el id recibido
  logger.log("SubalmacenCard id:", id);
  return (
    <div
      className="bg-white rounded-lg shadow flex flex-col items-center justify-center p-8 cursor-pointer hover:shadow-lg transition border border-gray-100"
      onClick={() => navigate(`/subalmacenes/${id}/fechas`)}
    >
      <div className="text-4xl">🏢</div>
      <span className="font-bold text-gray-500 text-base tracking-wide text-center mt-2">
        {nombre}
      </span>
    </div>
  );
}
