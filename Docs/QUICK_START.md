# Quick Start - Private Hub Dashboard

## 1. Start the services (Pi)
```bash
docker compose -f docker-compose.pi.yml up -d --build
```

## 2. Access your services
- **Main Search**: `http://your-pi-ip/` or `https://your-pi-ip/` (SearXNG)
- **Pi-hole Admin**: `http://your-pi-ip/admin` or `https://your-pi-ip/admin`
- **Dashboard**: `http://your-pi-ip/dashboard` or `https://your-pi-ip/dashboard`

## That's it!

The dashboard is served as static files by nginx for maximum performance on the Pi.

### What was added:
- Frontend React app at `/dashboard` (static files via nginx)
- Docker API proxy at `/api/docker/`
- Container management interface

### What wasn't changed:
- Your existing Pi-hole setup
- Your existing SearXNG setup  
- Your existing nginx configuration (just added routes)
- Your existing SSL certificates