import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    svgr({
      include: '**/*.svg',
      exclude: 'node_modules',
      svgrOptions: {
        ref: true,
        svgo: false,
        plugins: ['@svgr/plugin-jsx'],
      },
    }),
    tailwindcss(),
    react(),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.json', '.css'],
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  // Use root base so assets resolve from /assets regardless of subpath like /dashboard or /home
  // base: '/',
  base: '/dashboard/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000,
    strictPort: false,  // Allow Vite to find another port if specified port is busy
    allowedHosts: 'all',  // Allow nginx to proxy from "frontend" hostname
    watch: {
      usePolling: true  // For Windows volume mounts
    },
    // Proxy Docker API for container management (needed for dashboard functionality)
    proxy: {
      '/api/docker': {
        target: process.env.DOCKER_PROXY_URL || 'http://docker-proxy:2375',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/docker/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Docker API proxy error:', err.message);
          });
        }
      }
    }
  }
})