# Development vs Production Setup

## Windows Development (Container with Hot Reload)

### How it works:
1. **Frontend container** runs Vite dev server with file watching
2. **Volume mounts** enable hot reload (file changes trigger rebuild)
3. **Nginx proxies** to frontend container at `frontend:3000`
4. **Isolated environment** - no need to install Node.js on Windows

### To run:
```bash
# Start everything including frontend container
docker compose -f docker-compose.windows.yml up -d

# Check that frontend container is running
docker compose -f docker-compose.windows.yml ps

# View frontend logs to see if Vite is running
docker compose -f docker-compose.windows.yml logs frontend
```

### Access:
- `https://localhost/dashboard` → Frontend container (hot reload)
- `https://localhost/home` → Same as dashboard
- `https://localhost/admin` → Pi-hole
- `https://localhost/` → SearXNG

### File changes:
- Edit files in `./frontend/src/`
- Container automatically rebuilds
- Nginx serves the rebuilt files
- Browser hot reloads

## Pi Production (Static Files)

### How it works:
1. **Build React app** to static files
2. **Copy built files** to nginx html directory  
3. **Nginx serves static files** directly (no frontend container)
4. **Optimized for Pi** - no Node.js runtime needed

### To build:
```bash
# Build static files locally
cd frontend
npm install
npm run build

# Copy to nginx html directory
mkdir -p nginx/html
cp -r frontend/dist/* nginx/html/

# Use production nginx config
docker compose -f docker-compose.pi.yml up -d
```

## Why This Approach Works

### Development Benefits:
- ✅ **Isolated environment** (container)
- ✅ **Hot reload** (volume mounts + file watching)
- ✅ **No Windows Node.js issues** (runs in container)
- ✅ **Same nginx routing** as production

### Production Benefits:  
- ✅ **No extra containers** (static files only)
- ✅ **Fast serving** (nginx static file handling)
- ✅ **Low resource usage** (no Node.js runtime)
- ✅ **Cached assets** (optimal for Pi)

## Troubleshooting

### Frontend container not starting:
```bash
docker compose -f docker-compose.windows.yml logs frontend
```

### Hot reload not working:
- Check `CHOKIDAR_USEPOLLING=true` in environment
- Verify volume mounts are correct
- Check file permissions

### Nginx can't reach frontend:
```bash
# Test container networking
docker exec nginx ping frontend
```