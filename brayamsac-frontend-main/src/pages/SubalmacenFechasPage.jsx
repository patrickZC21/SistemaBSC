import { useParams } from "react-router-dom";

import PaginaFechas from "./fechas";

export default function SubalmacenFechasPage() {
  const { id } = useParams();
  return <PaginaFechas subalmacenId={id} />;
}