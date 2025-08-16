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
  // Use root base so assets resolve from /assets regardless of subpath like /dashboard or /home
  // base: '/',
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
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000,
    strictPort: false,  // Allow Vite to find another port if specified port is busy
    allowedHosts: 'all',  // Allow nginx to proxy from "frontend" hostname
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true' || process.env.DOCKER_ENV === 'true'  // For Docker volume mounts and file watching
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