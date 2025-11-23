import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  const config = {
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env.VITE_PORT) || 5174,
      host: true, // Permite conexiones externas para móviles
      proxy: {
        '/api': env.VITE_API_URL || 'http://localhost:3000'
      }
    },
    build: {
      // Optimizaciones para móviles
      rollupOptions: {
        output: {
          manualChunks: mode === 'mobile' ? {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom']
          } : undefined
        }
      },
      // Reducir el tamaño del bundle para móviles
      minify: mode === 'mobile' ? 'terser' : 'esbuild',
      target: mode === 'mobile' ? 'es2015' : 'es2020'
    }
  }
  
  return config
})
