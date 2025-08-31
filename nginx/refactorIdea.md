# Complete Nginx Gateway Implementation Guide
## Hybrid Architecture with Dynamic Configuration

### Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Understanding the Design Decisions](#understanding-the-design-decisions)
3. [Project Structure](#project-structure)
4. [Complete Configuration Files](#complete-configuration-files)
5. [Implementation Checklist](#implementation-checklist)
6. [Deployment Scenarios](#deployment-scenarios)
7. [Testing Procedures](#testing-procedures)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Architecture Overview

### What We're Building

We're creating a unified gateway system where nginx acts as the intelligent front door to all your services. Most services will live on the main domain using path-based routing (which avoids CORS complexity), while only problematic services like PiHole get their own subdomain. This hybrid approach gives you the best of both worlds: simplicity for services you control, and compatibility for services that need it.

The system will adapt dynamically to whatever hostname your machine has, require no hardcoded values, and work identically whether nginx runs in a container or directly on the host. Most importantly, nginx will start independently of other services, serving error pages immediately while other services initialize.

### Service Layout

Here's how services will be accessible in the final setup:

- `https://hostname.local/` - SearXNG search engine (your main interface)
- `https://hostname.local/api/` - Your backend API (same origin, no CORS)
- `https://hostname.local/n8n/` - n8n automation (supports subpaths natively)
- `https://pihole.hostname.local/` - PiHole admin (requires subdomain)

This layout preserves the simplicity of your current React setup while solving the PiHole path problem cleanly.

---

## Understanding the Design Decisions

### Why Nginx Starts First

When nginx uses variables in its proxy_pass directives, it doesn't resolve the upstream services at startup time. Instead, it waits until a request arrives, then tries to find the service. This means nginx can start immediately, even if all other services are down. If someone accesses your site while services are still starting, they'll see a proper error page instead of a connection refused error.

Think of it like a receptionist who starts work before the office opens. The receptionist can greet visitors and tell them "the accounting department isn't open yet" rather than leaving visitors standing outside a locked door. This is much more professional and user-friendly.

### Why the Hybrid Approach Works Best

By keeping most services on the main domain with path-based routing, your React application can make API calls using relative URLs like `/api/users`. The browser sees this as the same origin, so there's no CORS preflight requests, no additional headers needed, and no complexity in your frontend code. This is the simplicity you've already achieved and want to preserve.

PiHole gets a subdomain because it genuinely needs it. PiHole generates absolute URLs throughout its interface, and trying to rewrite all of them is fragile and breaks with updates. By giving PiHole its own subdomain, it works exactly as designed without any nginx manipulation.

### Why We Skip Redis/Valkey (For Now)

While caching can improve performance, it adds complexity and another service to manage. For your use case where you want fresh data and are running on a Raspberry Pi with limited resources, the overhead of running a cache service might actually hurt more than help. SearXNG works fine without Redis, and you can always add it later if you find performance lacking.

The principle here is to start simple and add complexity only when you have a specific, measured need for it. This aligns with your goal of maintainability and understanding every part of your system.

---

## Project Structure

```
privacy-hub/
├── certs/                          # SSL certificates at root level
│   ├── generate-cert.sh            # Generates wildcard certificate
│   ├── wildcard.crt                # Generated certificate (covers *.hostname.local)
│   └── wildcard.key                # Generated private key
│
├── nginx/
│   ├── nginx.conf                  # Main nginx configuration
│   ├── conf.d/                     # Shared configuration modules
│   │   ├── 00-resolver.conf        # DNS resolution settings
│   │   ├── 10-ssl.conf             # SSL/TLS configuration
│   │   ├── 10-security.conf        # Security headers
│   │   └── 10-proxy.conf           # Common proxy settings
│   ├── sites-available/            # Site configurations
│   │   ├── main.conf               # Main domain services
│   │   └── pihole.conf             # PiHole subdomain
│   ├── sites-enabled/              # Symlinks to active sites
│   └── html/                       # Static error pages
│       ├── 404.html                # Not found page
│       ├── 502.html                # Bad gateway page
│       └── maintenance.html        # Maintenance page
│
├── backend/                        # Your custom backend
│   ├── Dockerfile
│   └── src/
│
├── frontend/                       # Your React frontend
│   ├── Dockerfile
│   └── src/
│
├── docker-compose.yml              # Main compose file
├── docker-compose.override.yml     # Local overrides (git-ignored)
└── .env.example                    # Environment template
```

---

## Complete Configuration Files

### Main Nginx Configuration (nginx/nginx.conf)

```nginx
# Main nginx configuration
# This file orchestrates all nginx behavior and includes modular configs

user nginx;
worker_processes auto;
pid /var/run/nginx.pid;
error_log /var/log/nginx/error.log warn;

events {
    # Optimized for Raspberry Pi - not too many connections
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic MIME type handling
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Performance optimizations for Raspberry Pi
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Hide nginx version for security
    server_tokens off;

    # Logging format with useful debugging info
    log_format detailed '$remote_addr - $remote_user [$time_local] '
                       '"$request" $status $body_bytes_sent '
                       '"$http_referer" "$http_user_agent" '
                       'rt=$request_time uct="$upstream_connect_time" '
                       'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    access_log /var/log/nginx/access.log detailed;

    # Include modular configurations in order
    include /etc/nginx/conf.d/*.conf;
    
    # Include active site configurations
    include /etc/nginx/sites-enabled/*.conf;
}
```

### DNS Resolution Configuration (nginx/conf.d/00-resolver.conf)

```nginx
# DNS Resolution Configuration
# This is loaded first (00-) to ensure DNS is configured before anything else

# Try Docker's embedded DNS first, then fall back to public DNS
# 127.0.0.11 - Docker's embedded DNS (works when using docker-compose networks)
# 1.1.1.1 - Cloudflare's privacy-focused DNS
# 8.8.8.8 - Google's public DNS as last resort
resolver 127.0.0.11 1.1.1.1 8.8.8.8 valid=30s ipv6=off;
resolver_timeout 2s;

# This configuration allows nginx to:
# 1. Find Docker containers by name when nginx is in Docker
# 2. Find Docker containers by name when nginx is on the host
# 3. Fall back to public DNS if Docker DNS isn't available
```

### SSL Configuration (nginx/conf.d/10-ssl.conf)

```nginx
# SSL/TLS Configuration
# Modern, secure settings that work on all browsers from 2020+

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# SSL session caching for better performance
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;  # 10MB cache holds about 40000 sessions
ssl_session_tickets off;

# OCSP stapling (disabled for self-signed certs)
ssl_stapling off;
ssl_stapling_verify off;
```

### Security Headers Configuration (nginx/conf.d/10-security.conf)

```nginx
# Security Headers Configuration
# These headers improve security without breaking functionality

# Prevent clickjacking attacks
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS filter in browsers
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# HSTS - Force HTTPS for 6 months
add_header Strict-Transport-Security "max-age=15552000; includeSubDomains" always;
```

### Proxy Configuration (nginx/conf.d/10-proxy.conf)

```nginx
# Common Proxy Configuration
# These settings are used by all proxy_pass directives

# Use HTTP/1.1 for upstream connections (required for keepalive)
proxy_http_version 1.1;

# Pass through the original host header
proxy_set_header Host $host;

# Pass the real client IP to upstream services
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# WebSocket support (works even if not needed)
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

# Timeouts balanced for responsiveness and reliability
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# Disable buffering for real-time applications
proxy_buffering off;
proxy_request_buffering off;

# Don't retry failed requests (let the client handle retries)
proxy_next_upstream off;
```

### Main Site Configuration (nginx/sites-available/main.conf)

```nginx
# Main Site Configuration
# Handles all services on the primary domain using path-based routing

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name _;  # Accept any hostname
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Main HTTPS server
server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name _;  # Accept any hostname
    
    # SSL certificates (wildcard cert works for main domain too)
    ssl_certificate /etc/nginx/certs/wildcard.crt;
    ssl_certificate_key /etc/nginx/certs/wildcard.key;
    
    # Include SSL and security configurations
    include /etc/nginx/conf.d/10-ssl.conf;
    include /etc/nginx/conf.d/10-security.conf;
    
    # Root directory for error pages
    root /usr/share/nginx/html;
    
    # Default route - SearXNG search engine
    location / {
        include /etc/nginx/conf.d/10-proxy.conf;
        
        # Use a variable to enable dynamic resolution
        # This allows nginx to start even if searxng is down
        set $searxng_upstream searxng:8080;
        proxy_pass http://$searxng_upstream;
        
        # Handle errors gracefully
        error_page 502 503 504 /502.html;
    }
    
    # Backend API - your custom backend
    location /api {
        include /etc/nginx/conf.d/10-proxy.conf;
        
        # Strip /api prefix before passing to backend
        rewrite ^/api/(.*) /$1 break;
        
        # Dynamic resolution for backend
        set $backend_upstream backend:3000;
        proxy_pass http://$backend_upstream;
        
        # API-specific error handling
        error_page 502 503 504 @api_error;
    }
    
    # n8n automation platform
    location /n8n {
        include /etc/nginx/conf.d/10-proxy.conf;
        
        # n8n can handle being at a subpath
        set $n8n_upstream n8n:5678;
        proxy_pass http://$n8n_upstream;
        
        # n8n needs to know its base path
        proxy_set_header X-Script-Name /n8n;
        
        # Longer timeout for workflows
        proxy_read_timeout 300s;
        
        error_page 502 503 504 /502.html;
    }
    
    # n8n webhooks (must be accessible at root level)
    location /webhook {
        include /etc/nginx/conf.d/10-proxy.conf;
        
        set $n8n_upstream n8n:5678;
        proxy_pass http://$n8n_upstream/webhook;
        
        # Webhooks might receive large payloads
        client_max_body_size 100M;
    }
    
    # API error handler - return JSON errors
    location @api_error {
        default_type application/json;
        return 503 '{"error":"Service temporarily unavailable","status":503,"message":"Please try again later"}';
    }
    
    # Health check endpoint (always works)
    location /health {
        access_log off;
        default_type application/json;
        return 200 '{"status":"healthy","timestamp":"$time_iso8601","hostname":"$hostname"}';
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 502 503 504 /502.html;
    
    location = /404.html {
        internal;
    }
    
    location = /502.html {
        internal;
    }
}
```

### PiHole Subdomain Configuration (nginx/sites-available/pihole.conf)

```nginx
# PiHole Subdomain Configuration
# PiHole requires its own subdomain to function properly

server {
    listen 80;
    server_name pihole.*;  # Matches pihole.anything
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pihole.*;  # Matches pihole.anything
    
    # Use the same wildcard certificate
    ssl_certificate /etc/nginx/certs/wildcard.crt;
    ssl_certificate_key /etc/nginx/certs/wildcard.key;
    
    # Include SSL and security configurations
    include /etc/nginx/conf.d/10-ssl.conf;
    include /etc/nginx/conf.d/10-security.conf;
    
    # PiHole gets the entire root of this subdomain
    location / {
        include /etc/nginx/conf.d/10-proxy.conf;
        
        # Dynamic resolution for PiHole
        set $pihole_upstream pihole:80;
        proxy_pass http://$pihole_upstream;
        
        # PiHole-specific settings
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Handle errors
        error_page 502 503 504 /502.html;
    }
    
    # Error page
    location = /502.html {
        root /usr/share/nginx/html;
        internal;
    }
}
```

### Error Pages (nginx/html/502.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Temporarily Unavailable</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 {
            font-size: 4rem;
            margin: 0;
        }
        h2 {
            font-size: 1.5rem;
            font-weight: 300;
            margin: 1rem 0;
        }
        p {
            opacity: 0.9;
            max-width: 400px;
            margin: 2rem auto;
            line-height: 1.6;
        }
        .retry-button {
            background: white;
            color: #667eea;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .retry-button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>502</h1>
        <h2>Service Starting Up</h2>
        <p>The service you're trying to reach is still starting up or temporarily unavailable. This usually resolves within a few seconds.</p>
        <button class="retry-button" onclick="location.reload()">Try Again</button>
    </div>
</body>
</html>
```

### Certificate Generation Script (certs/generate-cert.sh)

```bash
#!/bin/bash
# Wildcard Certificate Generation Script
# Creates a single certificate that works for all subdomains

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Get hostname (can be overridden by passing as argument)
HOSTNAME=${1:-$(hostname)}

echo "======================================"
echo "Wildcard Certificate Generation"
echo "======================================"
echo "Hostname: $HOSTNAME"
echo ""

# Create certificate configuration
cat > cert.conf <<EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = Local
L = Home
O = Privacy Hub
CN = *.$HOSTNAME.local

[v3_req]
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $HOSTNAME.local
DNS.2 = *.$HOSTNAME.local
DNS.3 = localhost
DNS.4 = *.localhost
IP.1 = 127.0.0.1
EOF

# Generate private key
echo "Generating private key..."
openssl genrsa -out wildcard.key 2048

# Generate certificate
echo "Generating certificate..."
openssl req -x509 -new -nodes \
    -key wildcard.key \
    -sha256 \
    -days 3650 \
    -out wildcard.crt \
    -config cert.conf

# Clean up
rm cert.conf

echo ""
echo "✅ Certificate generated successfully!"
echo ""
echo "This certificate covers:"
echo "  - $HOSTNAME.local (main domain)"
echo "  - *.$HOSTNAME.local (all subdomains)"
echo "  - localhost"
echo ""
echo "Certificate files:"
echo "  - wildcard.crt (certificate)"
echo "  - wildcard.key (private key)"
echo ""
echo "To trust this certificate on your devices:"
echo "  - Windows: Double-click wildcard.crt and install to 'Trusted Root'"
echo "  - macOS: Double-click wildcard.crt and add to Keychain"
echo "  - Linux: Copy to /usr/local/share/ca-certificates/ and run update-ca-certificates"
echo "  - iOS/Android: Email the certificate to yourself and install from settings"
```

### Docker Compose Configuration (docker-compose.yml)

```yaml
version: '3.8'

services:
  # Nginx starts first and doesn't depend on anything
  # It can serve error pages even if all other services are down
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/sites-available:/etc/nginx/sites-available:ro
      - ./nginx/sites-enabled:/etc/nginx/sites-enabled:ro
      - ./nginx/html:/usr/share/nginx/html:ro
      - ./certs:/etc/nginx/certs:ro
    networks:
      - privacy-hub
    # No depends_on - nginx starts independently

  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    restart: unless-stopped
    environment:
      - SEARXNG_BASE_URL=${SEARXNG_BASE_URL:-https://localhost/}
      - SEARXNG_SECRET_KEY=${SEARXNG_SECRET:-ultrasecretkey}
    volumes:
      - searxng-config:/etc/searxng
    networks:
      - privacy-hub

  backend:
    build:
      context: ./backend
      target: ${BUILD_TARGET:-production}
    container_name: backend
    restart: unless-stopped
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=3000
    volumes:
      - backend-data:/app/data
    networks:
      - privacy-hub

  pihole:
    image: pihole/pihole:latest
    container_name: pihole
    restart: unless-stopped
    environment:
      - TZ=${TZ:-UTC}
      - WEBPASSWORD=${PIHOLE_PASSWORD:-admin}
      - VIRTUAL_HOST=pihole.${HOSTNAME:-localhost}.local
      - FTLCONF_LOCAL_IPV4=${HOST_IP:-127.0.0.1}
    volumes:
      - pihole-etc:/etc/pihole
      - pihole-dnsmasq:/etc/dnsmasq.d
    networks:
      - privacy-hub
    cap_add:
      - NET_ADMIN

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    environment:
      - N8N_HOST=${HOSTNAME:-localhost}.local
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_PATH=/n8n
      - WEBHOOK_URL=https://${HOSTNAME:-localhost}.local/webhook
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-admin}
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - privacy-hub

networks:
  privacy-hub:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  searxng-config:
  backend-data:
  pihole-etc:
  pihole-dnsmasq:
  n8n-data:
```

### Environment Template (.env.example)

```bash
# Copy this file to .env and customize for your setup

# Hostname Configuration
# This should match your machine's hostname for automatic configuration
HOSTNAME=privacy-hub

# Network Configuration
# Your machine's IP address on the local network
HOST_IP=192.168.1.100

# Service Passwords
PIHOLE_PASSWORD=changeme
N8N_USER=admin
N8N_PASSWORD=changeme
SEARXNG_SECRET=changeme

# Build Configuration
# Use 'development' for hot-reload, 'production' for optimized builds
NODE_ENV=production
BUILD_TARGET=production

# Timezone
TZ=UTC
```

---

## Implementation Checklist

### Phase 1: Initial Setup
- [ ] Clone or create the project structure as shown above
- [ ] Copy `.env.example` to `.env` and configure your values
- [ ] Generate SSL certificates by running `bash certs/generate-cert.sh`
- [ ] Create the nginx configuration files exactly as shown
- [ ] Create error pages in `nginx/html/`
- [ ] Create symbolic links in `nginx/sites-enabled/`:
  ```bash
  cd nginx/sites-enabled
  ln -s ../sites-available/main.conf .
  ln -s ../sites-available/pihole.conf .
  ```

### Phase 2: DNS Configuration
- [ ] Access your router or PiHole DNS settings
- [ ] Add DNS entries:
  - `hostname.local` → Your machine's IP
  - `pihole.hostname.local` → Same IP
- [ ] Test DNS resolution:
  ```bash
  nslookup hostname.local
  nslookup pihole.hostname.local
  ```

### Phase 3: Service Deployment
- [ ] Start services with Docker Compose:
  ```bash
  docker-compose up -d
  ```
- [ ] Verify nginx started first and is running:
  ```bash
  docker ps
  docker logs nginx
  ```
- [ ] Test nginx is serving error pages while services start:
  ```bash
  curl -k https://localhost/
  ```

### Phase 4: Verification
- [ ] Access each service and verify it works:
  - [ ] https://hostname.local/ - SearXNG loads
  - [ ] https://hostname.local/api/health - API health check returns JSON
  - [ ] https://hostname.local/n8n/ - n8n interface loads
  - [ ] https://pihole.hostname.local/ - PiHole admin loads
- [ ] Check nginx logs for any errors:
  ```bash
  docker logs nginx
  ```
- [ ] Verify error pages work by stopping a service:
  ```bash
  docker stop searxng
  # Visit https://hostname.local/ - should see 502 error page
  docker start searxng
  ```

---

## Deployment Scenarios

### Scenario 1: Docker Container (Development Machine)

This is the simplest scenario where everything runs in Docker containers, perfect for development on Windows, Mac, or Linux desktop machines.

**Step-by-step process:**

1. Install Docker and Docker Compose on your machine
2. Clone the project to your development machine
3. Copy `.env.example` to `.env` and set your hostname
4. Generate certificates:
   ```bash
   cd certs
   bash generate-cert.sh
   cd ..
   ```
5. Create nginx symbolic links:
   ```bash
   cd nginx/sites-enabled
   ln -s ../sites-available/main.conf .
   ln -s ../sites-available/pihole.conf .
   cd ../..
   ```
6. Start everything:
   ```bash
   docker-compose up -d
   ```
7. Add the certificate to your system's trust store
8. Configure your hosts file or local DNS to point hostname.local to 127.0.0.1

**Testing:** Open https://hostname.local in your browser. You should see the SearXNG search page.

### Scenario 2: Linux Host (Ubuntu/Debian Server)

For a dedicated Linux server where you want nginx on the host for better performance.

**Step-by-step process:**

1. Install nginx on the host:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```
2. Stop and disable default nginx:
   ```bash
   sudo systemctl stop nginx
   sudo systemctl disable nginx
   ```
3. Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | bash
   sudo usermod -aG docker $USER
   ```
4. Clone the project
5. Generate certificates:
   ```bash
   cd certs
   bash generate-cert.sh
   cd ..
   ```
6. Copy nginx configuration to system location:
   ```bash
   sudo cp -r nginx/* /etc/nginx/
   sudo cp -r certs /etc/nginx/
   ```
7. Create symbolic links for sites:
   ```bash
   cd /etc/nginx/sites-enabled
   sudo ln -s ../sites-available/main.conf .
   sudo ln -s ../sites-available/pihole.conf .
   ```
8. Start nginx on host:
   ```bash
   sudo nginx -t  # Test configuration
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```
9. Start Docker services without nginx:
   ```bash
   docker-compose up -d --scale nginx=0
   ```

**Testing:** Access the server by its IP or hostname. Verify nginx is running on the host with `systemctl status nginx`.

### Scenario 3: Raspberry Pi (Optimized Setup)

This scenario optimizes for the Raspberry Pi's limited resources by running nginx on the host.

**Step-by-step process:**

1. Start with Raspberry Pi OS Lite (64-bit recommended for Pi 4)
2. Update the system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. Install nginx:
   ```bash
   sudo apt install nginx
   ```
4. Install Docker using the convenience script:
   ```bash
   curl -fsSL https://get.docker.com | bash
   sudo usermod -aG docker $USER
   # Log out and back in for group changes to take effect
   ```
5. Install Docker Compose:
   ```bash
   sudo apt install python3-pip
   pip3 install docker-compose
   ```
6. Clone the project to `/opt/privacy-hub`:
   ```bash
   sudo mkdir /opt/privacy-hub
   sudo chown $USER:$USER /opt/privacy-hub
   cd /opt
   git clone [your-repo] privacy-hub
   cd privacy-hub
   ```
7. Generate certificates:
   ```bash
   cd certs
   bash generate-cert.sh $(hostname)
   cd ..
   ```
8. Set up nginx configuration:
   ```bash
   # Remove default site
   sudo rm /etc/nginx/sites-enabled/default
   
   # Copy configurations
   sudo cp -r nginx/* /etc/nginx/
   sudo cp -r certs /etc/nginx/
   
   # Create symbolic links
   cd /etc/nginx/sites-enabled
   sudo ln -s ../sites-available/main.conf .
   sudo ln -s ../sites-available/pihole.conf .
   ```
9. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your Raspberry Pi's hostname and IP
   nano .env
   ```
10. Enable nginx to start on boot:
    ```bash
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    ```
11. Start Docker services:
    ```bash
    docker-compose up -d --scale nginx=0
    ```
12. Set up PiHole DNS entries:
    - Access PiHole at https://pihole.hostname.local
    - Go to Local DNS → DNS Records
    - Add entries for your hostname and pihole.hostname

**Performance optimizations for Raspberry Pi:**
- Add to `/etc/sysctl.conf`:
  ```bash
  vm.swappiness=10
  net.core.somaxconn=1024
  net.ipv4.tcp_max_syn_backlog=2048
  ```
- Create a systemd service to start containers on boot:
  ```bash
  sudo nano /etc/systemd/system/privacy-hub.service
  ```
  ```ini
  [Unit]
  Description=Privacy Hub Services
  After=docker.service
  Requires=docker.service
  
  [Service]
  Type=oneshot
  RemainAfterExit=yes
  WorkingDirectory=/opt/privacy-hub
  ExecStart=/usr/local/bin/docker-compose up -d --scale nginx=0
  ExecStop=/usr/local/bin/docker-compose down
  
  [Install]
  WantedBy=multi-user.target
  ```
  ```bash
  sudo systemctl enable privacy-hub.service
  ```

**Testing:** Reboot the Raspberry Pi and verify all services start automatically. Check resource usage with `htop`.

---

## Testing Procedures

### Basic Connectivity Tests

Test that each service is accessible:
```bash
# Test main search page
curl -k https://localhost/

# Test API health
curl -k https://localhost/api/health

# Test n8n
curl -k https://localhost/n8n/

# Test PiHole subdomain
curl -k https://pihole.localhost/
```

### Error Handling Tests

Verify nginx handles down services gracefully:
```bash
# Stop a service
docker stop searxng

# Test that nginx returns error page, not connection refused
curl -k -I https://localhost/
# Should return 502 or 503, not fail to connect

# Restart service
docker start searxng
```

### DNS Resolution Tests

Verify nginx can resolve service names:
```bash
# Enter nginx container (if running in Docker)
docker exec -it nginx sh

# Test DNS resolution
nslookup searxng
nslookup backend
nslookup pihole

# Exit container
exit
```

### SSL Certificate Tests

Verify the wildcard certificate works:
```bash
# Test main domain
openssl s_client -connect localhost:443 -servername hostname.local

# Test subdomain
openssl s_client -connect localhost:443 -servername pihole.hostname.local
```

### Performance Tests

Monitor resource usage on Raspberry Pi:
```bash
# Check memory usage
free -h

# Check CPU usage
top

# Check Docker resource usage
docker stats

# Check nginx connections
sudo nginx -T | grep worker_connections
```

---

## Troubleshooting Guide

### Common Issues and Solutions

**Issue: "502 Bad Gateway" on all services**

This means nginx is running but can't reach the Docker services. Check that Docker containers are on the same network:
```bash
docker network ls
docker network inspect privacy-hub_privacy-hub
```

Ensure nginx can resolve Docker service names. If nginx is on the host, make sure the Docker network is accessible.

**Issue: SSL certificate warnings in browser**

The wildcard certificate needs to be trusted on each device. Install `certs/wildcard.crt` as a trusted root certificate on each device accessing the services.

**Issue: PiHole subdomain doesn't resolve**

Add the DNS entry in your router or in PiHole itself:
1. Access PiHole admin (might need to use IP initially)
2. Go to Local DNS → DNS Records
3. Add: `pihole.hostname.local` → your-ip-address

**Issue: Services work individually but not through nginx**

Check that nginx configuration uses variables in proxy_pass:
```nginx
# Correct - allows nginx to start without service
set $backend_upstream backend:3000;
proxy_pass http://$backend_upstream;

# Wrong - nginx fails if service is down
proxy_pass http://backend:3000;
```

**Issue: High memory usage on Raspberry Pi**

Reduce memory usage by:
1. Limiting container memory in docker-compose.yml:
   ```yaml
   services:
     searxng:
       mem_limit: 256m
   ```
2. Disable unnecessary services
3. Use swap space:
   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile
   # Set CONF_SWAPSIZE=2048
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

### Debugging Commands

Essential commands for troubleshooting:

```bash
# Check nginx configuration
nginx -t

# View nginx error logs
docker logs nginx
# Or on host:
sudo tail -f /var/log/nginx/error.log

# Test backend connectivity from nginx
docker exec nginx wget -O- http://backend:3000/health

# Check Docker DNS
docker exec nginx nslookup backend

# Verify nginx is using correct config
docker exec nginx nginx -T | grep -A5 "location /api"

# Monitor real-time logs
docker-compose logs -f

# Check port bindings
sudo netstat -tlnp | grep -E ':(80|443)'
```

---

## Conclusion

This configuration provides a robust, maintainable, and efficient gateway for your privacy hub. The hybrid approach keeps things simple where possible (path-based routing for most services) while accommodating services that need special handling (subdomain for PiHole). 

The system adapts to any hostname, requires no hardcoded values, and works identically across different deployment scenarios. Most importantly, it's understandable - you can trace through the configuration and see exactly what each piece does and why it's there.

Remember that this is a living system. Start with this configuration, but don't be afraid to adjust it as you learn more about your specific needs. The modular structure makes it easy to modify individual pieces without breaking the whole system.

The key principles to maintain as you evolve this system:
- Keep nginx independent so it can start first and serve error pages
- Use variables in proxy_pass to enable dynamic resolution
- Maintain the separation between shared configs (conf.d) and site configs
- Document any special handling needed for specific services
- Test changes on a development machine before deploying to your Raspberry Pi

This architecture will serve you well as your privacy hub grows and evolves.