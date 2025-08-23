import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'

// Read package.json for version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// Get build timestamp that only changes when build actually happens
const buildTime = new Date().toISOString()
const buildId = Math.floor(Date.now() / 1000).toString(36) // Convert to base36 for shorter string

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
  // Serve everything from /dashboard/ path for NGINX routing
  base: '/dashboard/',
  define: {
    // Inject version information at build time
    __APP_VERSION__: JSON.stringify(packageJson.version),
    // Inject build timestamp that only changes when build actually happens
    __BUILD_TIME__: JSON.stringify(buildTime),
    __BUILD_ID__: JSON.stringify(buildId),
    __NODE_ENV__: JSON.stringify(process.env.NODE_ENV || 'development'),
  },
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
    port: 3000,
    strictPort: true,  // Must use port 3000 for Docker
    hmr: false, // Disable HMR entirely in development to avoid WebSocket issues
    allowedHosts: [
      'all',
      'otsi',
      'otsi.local',
      'localhost',
      '192.168.1.120',
    ],  // Allow all hosts in development
    watch: {
      usePolling: true,  // Required for Docker volume mounts
      interval: 1000     // Check for changes every second
    },
    // Proxy API requests to backend services
    proxy: {
      '/api/pi-system': {
        target: 'http://go_backend:8111',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pi-system/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Backend API proxy error:', err.message);
          });
        }
      },
      '/api/docker': {
        target: 'http://docker-proxy:2375',
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