import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000'
  console.log('[Vite config] Backend proxy target URL:', backendUrl)

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('[Vite Proxy Error /api]:', err.message);
            });
          }
        },
        '/audio': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('[Vite Proxy Error /audio]:', err.message);
            });
          }
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('socket.io-client')) {
                return 'socket-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'lucide-vendor';
              }
              return 'vendor'; // all other node_modules
            }
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  }
})
