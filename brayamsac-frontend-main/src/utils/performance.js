import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';

// Hook para debounce optimizado
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para memoización de cálculos costosos
export const useExpensiveCalculation = (computeFn, dependencies) => {
  return useMemo(() => {
    const startTime = performance.now();
    const result = computeFn();
    const endTime = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`Cálculo costoso completado en ${endTime - startTime}ms`);
    }
    
    return result;
  }, dependencies);
};

// Hook para lazy loading de datos
export const useLazyData = (fetchFn, dependencies = []) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const abortControllerRef = React.useRef();

  const fetchData = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(abortControllerRef.current.signal);
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, dependencies);

  React.useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Hook para virtualización de listas grandes
export const useVirtualList = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
};

// HOC para memoización de componentes
export const withMemo = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual);
};

// Componente optimizado para listas grandes
export const OptimizedList = memo(({ 
  items, 
  renderItem, 
  keyExtractor = (item, index) => item.id || index,
  onEndReached,
  onEndReachedThreshold = 0.8,
  loading = false,
  itemHeight = 60,
  maxHeight = 400 
}) => {
  const { visibleItems, totalHeight, offsetY, onScroll } = useVirtualList(
    items, 
    itemHeight, 
    maxHeight
  );

  const handleScroll = useCallback((e) => {
    onScroll(e);
    
    // Infinite scroll
    if (onEndReached) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const threshold = scrollHeight * onEndReachedThreshold;
      
      if (scrollTop + clientHeight >= threshold) {
        onEndReached();
      }
    }
  }, [onScroll, onEndReached, onEndReachedThreshold]);

  return (
    <div 
      className="overflow-auto"
      style={{ maxHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={keyExtractor(item, index)} style={{ height: itemHeight }}>
              {renderItem(item, item.index)}
            </div>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
});

// Componente de carga lazy optimizado
export const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <div>Cargando...</div>}>
    {children}
  </Suspense>
);

// Cache simple para resultados de computación
class ComputationCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // Mover al final (LRU)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remover el más antiguo
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const computationCache = new ComputationCache();

// Hook para cache de computaciones
export const useCachedComputation = (computeFn, dependencies, cacheKey) => {
  return useMemo(() => {
    const key = cacheKey || JSON.stringify(dependencies);
    
    if (computationCache.has(key)) {
      return computationCache.get(key);
    }
    
    const result = computeFn();
    computationCache.set(key, result);
    return result;
  }, dependencies);
};

// Hook para detectar cambios en el viewport
export const useInViewport = (ref, options = {}) => {
  const [isInViewport, setIsInViewport] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      options
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isInViewport;
};

// Componente para carga lazy de imágenes
export const LazyImage = memo(({ src, alt, className, placeholder, ...props }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef();
  const inViewport = useInViewport(imgRef, { threshold: 0.1 });

  React.useEffect(() => {
    if (inViewport && !loaded && !error) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
      img.src = src;
    }
  }, [inViewport, src, loaded, error]);

  return (
    <div ref={imgRef} className={className}>
      {loaded ? (
        <img src={src} alt={alt} {...props} />
      ) : error ? (
        <div className="bg-gray-200 flex items-center justify-center">
          Error al cargar imagen
        </div>
      ) : (
        placeholder || (
          <div className="bg-gray-200 animate-pulse">
            Cargando...
          </div>
        )
      )}
    </div>
  );
});

// Lazy loading de componentes con nombres descriptivos
export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyAlmacenes = lazy(() => import('../pages/Almacenes'));
export const LazyTrabajadores = lazy(() => import('../pages/trabajadoresLista'));
export const LazyCoordinadores = lazy(() => import('../pages/Coordinadores'));
export const LazyRRHH = lazy(() => import('../pages/RRHH'));

// Monitor de performance
export const performanceMonitor = {
  startTime: null,
  endTime: null,
  
  start: (label) => {
    if (import.meta.env.DEV) {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label) => {
    if (import.meta.env.DEV) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  },
  
  measureRender: (Component) => {
    return React.forwardRef((props, ref) => {
      React.useEffect(() => {
        performanceMonitor.start(`${Component.name}-render`);
        return () => performanceMonitor.end(`${Component.name}-render`);
      });
      
      return <Component {...props} ref={ref} />;
    });
  }
};
