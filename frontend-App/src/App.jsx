import AppRouter from "./pages/AppRouter";
import { usePreventAppClose } from "./hooks/usePreventAppClose";
import PerformanceMonitor from "./components/PerformanceMonitor";

function App() {
  // Hook para prevenir cierres innecesarios en dispositivos móviles
  usePreventAppClose();
  
  // Mostrar el flujo real de navegación (almacén > subalmacén > fechas > asistencias)
  return (
    <>
      <AppRouter />
      <PerformanceMonitor />
    </>
  );
}

export default App;
