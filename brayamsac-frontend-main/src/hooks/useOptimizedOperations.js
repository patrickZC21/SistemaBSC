import { useCallback, useRef } from 'react';

/**
 * Hook para optimizar operaciones con debounce
 */
export const useOptimizedOperations = () => {
  const timeoutRef = useRef(null);
  const saveOperationRef = useRef(null);

  /**
   * Debounce para operaciones de guardado
   */
  const debouncedSave = useCallback((operation, delay = 300) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }, []);

  /**
   * Cancela operaciones pendientes
   */
  const cancelPendingOperations = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Operación de guardado optimizada con cancelación
   */
  const optimizedSave = useCallback(async (saveOperation) => {
    // Cancelar operación anterior
    if (saveOperationRef.current) {
      saveOperationRef.current.abort();
    }

    // Crear nuevo controlador de cancelación
    const controller = new AbortController();
    saveOperationRef.current = controller;

    try {
      const result = await saveOperation(controller.signal);
      if (!controller.signal.aborted) {
        saveOperationRef.current = null;
        return result;
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        saveOperationRef.current = null;
        throw error;
      }
    }
  }, []);

  return {
    debouncedSave,
    cancelPendingOperations,
    optimizedSave
  };
};

export default useOptimizedOperations;
