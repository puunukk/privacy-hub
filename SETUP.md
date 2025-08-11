# Private Hub Dashboard Setup

## Quick Start

### 1. Generate SSL Certificates
```bash
# Create certs directory if it doesn't exist
mkdir -p certs

# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certs/server.key \
    -out certs/server.crt \
    -subj "/C=US/ST=Dev/L=Dev/O=Private Hub/OU=Dev/CN=localhost"
```

### 2. Development Environment
```bash
# Start development environment
docker compose -f docker-compose.windows.yml up -d

# Stop development environment  
docker compose -f docker-compose.windows.yml down
```

### 3. Production Environment
```bash
# Start production environment
docker compose up -d

# Stop production environment
docker compose down  
```

## Access URLs

### Development
- **Main Search**: `https://localhost:8443/` (SearXNG)
- **Pi-hole Admin**: `https://localhost:8443/admin` 
- **Dashboard**: `https://localhost:8443/dashboard`
- **React Dev Server**: `http://localhost:3000` (with hot reload)

### Production  
- **Main Search**: `https://your-server/` (SearXNG)
- **Pi-hole Admin**: `https://your-server/admin`
- **Dashboard**: `https://your-server/dashboard`

## Development Features

- ✅ **Hot Reload** - Edit React code and see changes instantly
- ✅ **Volume Mounting** - Entire frontend directory mounted for development
- ✅ **TypeScript** - Full type checking and IntelliSense
- ✅ **Tailwind CSS** - Proper PostCSS processing (not CDN)
- ✅ **Component Hot Reload** - Edit any component and see changes

## Architecture Benefits

- **Single Entry Point** - Only nginx faces external traffic
- **Internal Networking** - All services communicate securely internally  
- **Docker Socket Proxy** - Secure container management without direct socket access
- **Component Structure** - Maintainable, reusable React components
- **TypeScript** - Catch errors at compile time, not runtime

## Security Notes

- SSL certificates should be proper certificates in production (not self-signed)
- Docker socket proxy limits container operations for security
- Rate limiting configured for Docker API endpoints
- All services except nginx are internal-only