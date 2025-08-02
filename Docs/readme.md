# Privacy Hub - Professional Raspberry Pi Network Security Setup

## Understanding What We're Building

This project transforms your Raspberry Pi into a professional-grade network security appliance that provides comprehensive privacy protection for every device on your network. Think of it as creating your own personal version of what companies like Cloudflare or Quad9 provide, but running entirely under your control in your home.

The beauty of this architecture lies in its simplicity from the user's perspective, while maintaining enterprise-level security and functionality underneath. Your parents will simply browse the internet normally, while every device automatically receives ad blocking, tracker prevention, and private search capabilities without any configuration required on their part.

## Architectural Philosophy: Why This Design Works

### The Reverse Proxy Approach

Our design centers around a fundamental principle used by every major internet company: the reverse proxy pattern. Instead of exposing multiple services directly to your network (which creates security vulnerabilities and management complexity), we expose only a single, hardened entry point that intelligently routes requests to the appropriate internal services.

This approach provides several critical advantages. First, it dramatically reduces your attack surface - Airbnb guests or any potentially untrusted devices can only interact with our carefully configured nginx proxy, not directly with Pi-hole or SearXNG. Second, it provides a clean, unified interface where users access everything through standard web ports (80 and 443) without needing to remember different port numbers. Third, it enables us to add features like HTTPS encryption, request filtering, and logging in a centralized location.

### Containerization Strategy

We use Docker containers not just for convenience, but for isolation and reliability. Each service runs in its own contained environment, which means if one service experiences issues, it cannot affect the others. This containerization also enables us to minimize disk writes (crucial for SD card longevity) by mounting logs and temporary files in RAM-based temporary filesystems.

The Docker Compose orchestration allows us to define relationships between services using service names rather than IP addresses, making the entire setup portable across different networks without any configuration changes. When you share this with your neighbor, Docker automatically handles all the internal networking regardless of what IP range their router uses.

### Security Through Layers

Our security model implements multiple layers of protection. The outermost layer is the firewall, which only allows essential ports (SSH for management, DNS for filtering, and HTTP/HTTPS for web access). The next layer is nginx, which acts as a security gateway, validating and filtering all incoming requests before they reach internal services. The innermost layer consists of our isolated containers, each running with minimal privileges and no direct network exposure.

This layered approach means that even if one component were compromised, an attacker would still need to break through additional layers to reach sensitive components or the host system.

## Complete Project Structure

Understanding the organization of our project helps clarify how each component contributes to the overall system:

```
parents-privacy-hub/
├── README.md                    # This comprehensive guide
├── docker-compose.yml           # Service orchestration and networking
├── .env                        # Environment variables (auto-generated)
├── .gitignore                  # Version control exclusions
├── nginx/                      # Reverse proxy and SSL termination
│   ├── Dockerfile             # Custom nginx container definition
│   ├── nginx.conf             # Main proxy configuration
│   └── ssl/                   # Self-signed certificates (auto-generated)
├── pihole/                     # Network-level ad and tracker blocking
│   ├── Dockerfile             # Custom Pi-hole container definition
│   ├── custom.list            # Local DNS overrides
│   ├── data/                  # Pi-hole configuration storage
│   └── dnsmasq/               # DNS server configuration
├── searxng/                    # Privacy-focused metasearch engine
│   ├── Dockerfile             # Custom SearXNG container definition
│   ├── settings.yml           # Search engine configuration
│   └── data/                  # SearXNG instance data
└── scripts/                    # Management and automation tools
    ├── setup.sh               # Initial deployment automation
    ├── manage.sh              # Service management utilities
    └── firewall.sh            # Security configuration
```

## Deep Dive: Service Architecture

### NGINX - The Security Gateway

NGINX serves as our reverse proxy, handling all external communication and routing requests to appropriate internal services. This design pattern is identical to what major websites use - when you visit a site like GitHub, you're actually talking to their reverse proxy, which then routes your request to the appropriate backend service.

Our NGINX configuration handles several critical functions. It terminates SSL encryption, providing HTTPS access using self-signed certificates that work perfectly for local network use. It routes the root path (/) to SearXNG, making private search the default experience when users visit your Pi's IP address. It routes the /admin path to Pi-hole's administration interface, providing easy access to blocking statistics and configuration. Finally, it forwards DNS queries (port 53) directly to Pi-hole for network-level filtering.

The key insight here is that NGINX acts as a translation layer between the external world and our internal services. External users see clean URLs like https://192.168.1.100/ for search and https://192.168.1.100/admin for administration, while internally these map to different containerized services running on different ports.

### Pi-hole - Network DNS Filtering

Pi-hole operates as a DNS sinkhole, which means it intercepts DNS queries (the process by which domain names like google.com get translated to IP addresses) and blocks requests for known advertising and tracking domains. When a device on your network tries to load an advertisement, Pi-hole simply refuses to resolve the ad server's domain name, effectively making the ad disappear before it can even be downloaded.

This approach is incredibly effective because it blocks ads at the network level, before they consume bandwidth or processing power on your devices. It works with any device that uses your network's DNS settings - smart TVs, phones, tablets, computers, and even IoT devices all benefit automatically without requiring any software installation or configuration.

Our Pi-hole configuration includes carefully selected blocklists that target advertising networks, tracking companies, and malicious domains while avoiding false positives that might break legitimate websites. The configuration also includes custom local DNS entries that make your services accessible via friendly names like pihole.local and search.local.

### SearXNG - Private Search Engine

SearXNG functions as a metasearch engine, which means it aggregates results from multiple search engines (Google, Bing, DuckDuckGo, and others) while stripping away tracking and personalization. When you search for something, SearXNG sends anonymized queries to multiple search engines, combines the results, and presents them to you without any tracking cookies or identifying information.

This provides several privacy advantages over using search engines directly. Your searches cannot be tied to your identity or IP address, since SearXNG acts as an intermediary. You get diverse results from multiple sources rather than being trapped in a single company's algorithmic bubble. You avoid the tracking pixels, cookies, and fingerprinting techniques that search companies typically use to build profiles of your behavior.

Our SearXNG configuration disables all logging and caching to disk, further protecting your privacy and extending your SD card's lifespan. The service is configured to run efficiently with minimal resource usage while providing fast, relevant search results.

## Complete Docker Compose Configuration

Our Docker Compose file defines the entire application stack and how services communicate with each other:

```yaml
version: '3.8'

services:
  # Pi-hole DNS filtering service
  # Runs internally without exposed ports for security
  pihole:
    build: ./pihole
    container_name: pihole
    hostname: pihole
    environment:
      TZ: 'Europe/Helsinki'                    # Adjust to your timezone
      WEBPASSWORD: 'secure123'                 # Change this password!
      FTLCONF_LOCAL_IPV4: ${SERVER_IP}        # Auto-detected server IP
      PIHOLE_DNS_: '1.1.1.1;1.0.0.1'         # Upstream DNS servers
      VIRTUAL_HOST: pihole.local               # Local hostname for easy access
    volumes:
      # Persistent storage for Pi-hole configuration
      - './pihole/data:/etc/pihole'
      - './pihole/dnsmasq:/etc/dnsmasq.d'
    tmpfs:
      # Use RAM for logs to protect SD card from excessive writes
      - /var/log
      - /tmp
    cap_add:
      # Required for DNS server functionality
      - NET_ADMIN
    restart: unless-stopped
    networks:
      - internal

  # SearXNG private search engine
  # Runs internally without exposed ports for security
  searxng:
    build: ./searxng
    container_name: searxng
    hostname: searxng
    environment:
      # Configure SearXNG to work behind reverse proxy
      - SEARXNG_BASE_URL=https://${SERVER_IP}/
    volumes:
      # Minimal persistent storage for configuration only
      - './searxng/data:/etc/searxng'
    tmpfs:
      # Use RAM for cache and logs to protect SD card
      - /var/log
      - /tmp
      - /var/cache
    restart: unless-stopped
    networks:
      - internal

  # NGINX reverse proxy - the only service exposed to the network
  # This is our security gateway that routes all external requests
  nginx:
    build: ./nginx
    container_name: nginx
    hostname: nginx
    ports:
      # These are the ONLY ports exposed to your local network
      - "53:53/tcp"      # DNS queries forwarded to Pi-hole
      - "53:53/udp"      # DNS queries forwarded to Pi-hole
      - "80:80"          # HTTP (redirects to HTTPS)
      - "443:443"        # HTTPS web interface
    volumes:
      # SSL certificates for HTTPS encryption
      - './nginx/ssl:/etc/nginx/ssl'
    tmpfs:
      # Use RAM for logs to protect SD card
      - /var/log/nginx
      - /tmp
    restart: unless-stopped
    depends_on:
      # Ensure backend services start before proxy
      - pihole
      - searxng
    networks:
      - internal

# Internal Docker network for service communication
# Services communicate using hostnames (pihole, searxng, nginx)
# Docker automatically handles IP assignment and DNS resolution
networks:
  internal:
    driver: bridge
    # No manual IP configuration needed - Docker handles everything
```

## NGINX Reverse Proxy Configuration

The nginx.conf file is the heart of our routing and security logic:

```nginx
# Optimize worker processes for Raspberry Pi
worker_processes auto;
error_log /dev/stderr crit;

events {
    worker_connections 1024;
}

# Stream block handles raw TCP/UDP traffic (for DNS forwarding)
stream {
    # Define Pi-hole as upstream DNS server
    upstream pihole_dns {
        server pihole:53;
    }
    
    # Forward UDP DNS queries (most common)
    server {
        listen 53 udp;
        proxy_pass pihole_dns;
        proxy_timeout 1s;
        proxy_responses 1;
    }
    
    # Forward TCP DNS queries (for large responses)
    server {
        listen 53;
        proxy_pass pihole_dns;
        proxy_timeout 1s;
    }
}

# HTTP block handles web traffic routing
http {
    include /etc/nginx/mime.types;
    
    # Disable access logs to protect SD card from excessive writes
    access_log off;
    error_log /dev/stderr crit;
    
    # Enable compression to improve performance over network
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    
    # Define backend services using Docker service names
    # This is why we don't need hardcoded IP addresses
    upstream searxng_backend {
        server searxng:8080;
    }
    
    upstream pihole_backend {
        server pihole:80;
    }
    
    # HTTP server configuration (redirects to HTTPS for security)
    server {
        listen 80;
        server_name _;
        
        # Force HTTPS for all web traffic
        return 301 https://$host$request_uri;
    }
    
    # HTTPS server configuration (main web interface)
    server {
        listen 443 ssl http2;
        server_name _;
        
        # SSL/TLS configuration for local network security
        ssl_certificate /etc/nginx/ssl/nginx.crt;
        ssl_certificate_key /etc/nginx/ssl/nginx.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        
        # Security headers to protect against common web attacks
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
        
        # Root location serves SearXNG (private search as homepage)
        # This makes search the default experience when visiting your Pi
        location / {
            proxy_pass http://searxng_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
        }
        
        # Pi-hole admin interface accessible via /admin path
        location /admin {
            proxy_pass http://pihole_backend/admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Handle Pi-hole's internal redirects correctly
            proxy_redirect http://$host/admin/ https://$host/admin/;
        }
        
        # Pi-hole API endpoints (required for admin interface functionality)
        location /admin/api {
            proxy_pass http://pihole_backend/admin/api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Health check endpoint for monitoring
        location /health {
            return 200 "Privacy Hub OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## NGINX Dockerfile for Custom Container

Our NGINX container includes SSL certificate generation and security optimizations:

```dockerfile
FROM nginx:alpine

# Install OpenSSL for generating self-signed certificates
RUN apk add --no-cache openssl

# Copy our custom configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed certificate for local network HTTPS
# This provides encryption for local traffic without requiring a CA
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=FI/ST=State/L=City/O=Home/CN=*.local"

# Disable access logs to protect SD card from excessive writes
RUN ln -sf /dev/null /var/log/nginx/access.log

# Expose necessary ports for DNS and web traffic
EXPOSE 53 80 443

# Start nginx in foreground mode for proper Docker operation
CMD ["nginx", "-g", "daemon off;"]
```

## Pi-hole Configuration and Dockerfile

Our Pi-hole setup focuses on effective ad blocking while minimizing disk writes:

```dockerfile
FROM pihole/pihole:latest

# Copy custom local DNS configuration
COPY custom.list /etc/pihole/custom.list

# Disable query logging to protect SD card and improve privacy
RUN echo 'log-queries=no' >> /etc/dnsmasq.conf

# Add effective blocklists for comprehensive ad and tracker blocking
RUN echo 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts' >> /etc/pihole/adlists.list && \
    echo 'https://someonewhocares.org/hosts/zero/hosts' >> /etc/pihole/adlists.list

# Configure Pi-hole to work properly behind reverse proxy
ENV VIRTUAL_HOST=pihole.local

# Expose DNS and web interface ports (used internally by Docker)
EXPOSE 53/tcp 53/udp 80/tcp

# Start Pi-hole with foreground logging for Docker
CMD ["pihole", "-f"]
```

The custom.list file provides local DNS resolution for friendly hostnames:

```
# Custom local DNS entries for easy access
# Replace 192.168.1.100 with your Pi's actual IP address
192.168.1.100 search.local
192.168.1.100 pihole.local
192.168.1.100 admin.local
192.168.1.100 privacy.local
```

## SearXNG Configuration for Private Search

Our SearXNG Dockerfile creates a privacy-focused search container:

```dockerfile
FROM searxng/searxng:latest

# Copy our privacy-optimized configuration
COPY settings.yml /etc/searxng/settings.yml

# Create dedicated user for security (principle of least privilege)
RUN adduser --system --group --no-create-home searxng

# Configure container to use RAM for temporary files
VOLUME ["/tmp", "/var/log"]

# Run as non-root user for security
USER searxng

# Expose search interface port (used internally by Docker)
EXPOSE 8080

# Start SearXNG with minimal logging
CMD ["python", "-m", "searx.webapp"]
```

The settings.yml file configures SearXNG for optimal privacy and performance:

```yaml
use_default_settings: true

server:
  secret_key: "CHANGE_ME_TO_RANDOM_50_CHARS"  # Will be auto-generated during setup
  bind_address: "0.0.0.0"
  port: 8080
  base_url: false                             # Let nginx handle URL routing
  public_instance: false                      # This is a private instance

search:
  safe_search: 1                              # Enable safe search by default
  autocomplete: ""                            # Disable autocomplete for privacy
  default_lang: "en"

ui:
  default_theme: simple                       # Clean, fast interface
  simple_style: dark                          # Easy on the eyes
  query_in_title: true                        # Show search terms in page title
  infinite_scroll: false                      # Traditional pagination
  center_alignment: true                      # Center search results
  
# Disable all logging to protect privacy and SD card
logging:
  level: CRITICAL

outgoing:
  request_timeout: 3.0                        # Fast timeout for responsive search
  max_request_timeout: 15.0                   # Maximum wait time
  
# Configure search engines for diverse, privacy-focused results
engines:
  - name: google
    disabled: false
  - name: duckduckgo
    disabled: false
  - name: startpage
    disabled: false
  - name: bing
    disabled: false
  - name: wikipedia
    disabled: false

# Organize search categories for easy access
categories_as_tabs:
  general: true
  images: true
  videos: true
  news: true
  map: true
  music: false
  it: false
  science: false
  files: false
  social media: false
```

## Automated Setup Script

The setup.sh script automates the entire deployment process:

```bash
#!/bin/bash
# Automated Privacy Hub Setup Script
# This script handles all the complex configuration automatically

set -e  # Exit on any error

echo "🛡️ Privacy Hub Setup Starting..."
echo "================================="

# Create necessary directory structure
echo "📁 Creating directory structure..."
mkdir -p pihole/{data,dnsmasq}
mkdir -p searxng/data
mkdir -p nginx/ssl

# Generate cryptographically secure random secret for SearXNG
echo "🔐 Generating secure random secrets..."
RANDOM_SECRET=$(openssl rand -hex 32)
sed -i "s/CHANGE_ME_TO_RANDOM_50_CHARS/$RANDOM_SECRET/" searxng/settings.yml

# Auto-detect local IP address for configuration
echo "🌐 Detecting network configuration..."
LOCAL_IP=$(hostname -I | cut -d' ' -f1)
echo "SERVER_IP=$LOCAL_IP" > .env
echo "✅ Detected IP address: $LOCAL_IP"

# Validate that we have a reasonable IP address
if [[ ! $LOCAL_IP =~ ^192\.168\.|^10\.|^172\. ]]; then
    echo "⚠️  Warning: Detected IP ($LOCAL_IP) doesn't appear to be a private network address"
    echo "   This setup is designed for local network use only"
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Build Docker containers with optimized caching
echo "🔨 Building Docker containers..."
docker-compose build --parallel

# Start all services in background
echo "🚀 Starting Privacy Hub services..."
docker-compose up -d

# Wait for services to fully initialize
echo "⏳ Waiting for services to initialize..."
sleep 30

# Verify that all services are running
echo "🔍 Verifying service health..."
if docker-compose ps | grep -q "Exit"; then
    echo "❌ Some services failed to start. Checking logs..."
    docker-compose logs
    exit 1
fi

# Display success message and usage information
echo ""
echo "🎉 Privacy Hub Setup Complete!"
echo "================================"
echo ""
echo "Your privacy hub is now running and ready to use:"
echo ""
echo "🔍 Private Search (Homepage): https://$LOCAL_IP"
echo "🛡️ Pi-hole Admin Interface:  https://$LOCAL_IP/admin"
echo "💊 Pi-hole Password:         secure123 (change this!)"
echo ""
echo "⚠️  SSL Certificate Warning:"
echo "   Your browser will show a security warning for the self-signed certificate."
echo "   This is normal and safe for local network use. Click 'Advanced' and 'Proceed'."
echo ""
echo "📋 Next Steps:"
echo "1. Configure your router's DNS settings:"
echo "   Primary DNS:   $LOCAL_IP"
echo "   Secondary DNS: 1.1.1.1"
echo ""
echo "2. Test the setup:"
echo "   - Visit https://$LOCAL_IP to test private search"
echo "   - Visit https://$LOCAL_IP/admin to see Pi-hole dashboard"
echo "   - Check that ads are being blocked on your devices"
echo ""
echo "🔧 Management Commands:"
echo "   ./scripts/manage.sh status    # Check service status"
echo "   ./scripts/manage.sh restart   # Restart all services"
echo "   ./scripts/manage.sh logs      # View service logs"
echo "   ./scripts/manage.sh update    # Update containers"
echo ""
echo "🔒 Security: Only essential ports (53, 80, 443) are exposed to your network."
echo "   Internal services are protected by the nginx reverse proxy."
```

## Service Management Script

The manage.sh script provides easy service administration:

```bash
#!/bin/bash
# Privacy Hub Management Script
# Provides easy commands for administering your privacy hub

PROJECT_DIR="/home/pi/parents-privacy-hub"
cd "$PROJECT_DIR"

# Color codes for better terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

case "$1" in
    start)
        print_status "Starting Privacy Hub services..."
        docker-compose up -d
        sleep 10
        if docker-compose ps | grep -q "Exit"; then
            print_error "Some services failed to start"
            docker-compose ps
            exit 1
        fi
        print_success "All services started successfully!"
        ;;
        
    stop)
        print_status "Stopping Privacy Hub services..."
        docker-compose down
        print_success "All services stopped!"
        ;;
        
    restart)
        if [ -n "$2" ]; then
            print_status "Restarting service: $2"
            docker-compose restart "$2"
            print_success "$2 restarted successfully!"
        else
            print_status "Restarting all services..."
            docker-compose restart
            print_success "All services restarted successfully!"
        fi
        ;;
        
    status)
        print_status "Privacy Hub Service Status:"
        echo ""
        docker-compose ps
        echo ""
        print_status "Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        ;;
        
    logs)
        if [ -n "$2" ]; then
            print_status "Showing logs for $2 (press Ctrl+C to exit):"
            docker-compose logs -f --tail=50 "$2"
        else
            print_status "Showing logs for all services (press Ctrl+C to exit):"
            docker-compose logs -f --tail=50
        fi
        ;;
        
    update)
        print_status "Updating Privacy Hub containers..."
        docker-compose pull
        docker-compose up -d
        print_success "Update completed successfully!"
        ;;
        
    rebuild)
        print_status "Rebuilding Privacy Hub containers from source..."
        docker-compose build --no-cache
        docker-compose up -d
        print_success "Rebuild completed successfully!"
        ;;
        
    backup)
        BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
        print_status "Creating backup in $BACKUP_DIR..."
        mkdir -p "$BACKUP_DIR"
        cp -r pihole/data "$BACKUP_DIR/pihole_data"
        cp -r searxng/data "$BACKUP_DIR/searxng_data"
        cp .env "$BACKUP_DIR/"
        print_success "Backup created successfully!"
        ;;
        
    restore)
        if [ -z "$2" ]; then
            print_error "Please specify backup directory: ./scripts/manage.sh restore backups/20231201_120000"
            exit 1
        fi
        if [ ! -d "$2" ]; then
            print_error "Backup directory $2 not found"
            exit 1
        fi
        print_warning "This will overwrite current configuration. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_status "Restoring from backup $2..."
            docker-compose down
            cp -r "$2/pihole_data" pihole/data
            cp -r "$2/searxng_data" searxng/data
            cp "$2/.env" .
            docker-compose up -d
            print_success "Restore completed successfully!"
        fi
        ;;
        
    clean)
        print_warning "This will remove all unused Docker images and containers. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_status "Cleaning up Docker resources..."
            docker system prune -f
            print_success "Cleanup completed!"
        fi
        ;;
        
    reset)
        print_error "This will completely reset Privacy Hub, removing all data and configuration."
        print_warning "This action cannot be undone. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_status "Resetting Privacy Hub..."
            docker-compose down
            docker system prune -a -f
            rm -rf pihole/data/* searxng/data/* nginx/ssl/*
            docker-compose build
            docker-compose up -d
            print_success "Reset completed successfully!"
        fi
        ;;
        
    health)
        print_status "Checking Privacy Hub health..."
        
        # Check if containers are running
        if ! docker-compose ps | grep -q "Up"; then
            print_error "Some services are not running"
            exit 1
        fi
        
        # Check web interface
        LOCAL_IP=$(grep SERVER_IP .env | cut -d'=' -f2)
        if curl -k -s "https://$LOCAL_IP/health" > /dev/null; then
            print_success "Web interface is responding"
        else
            print_error "Web interface is not responding"
        fi
        
        # Check DNS resolution
        if nslookup google.com "$LOCAL_IP" > /dev/null 2>&1; then
            print_success "DNS filtering is working"
        else
            print_error "DNS filtering is not working"
        fi
        
        print_success "Health check completed!"
        ;;
        
    *)
        echo "Privacy Hub Management Script"
        echo "Usage: $0 {command} [options]"
        echo ""
        echo "Service Management:"
        echo "  start                    Start all services"
        echo "  stop                     Stop all services"
        echo "  restart [service]        Restart all services or specific service"
        echo "  status                   Show service status and resource usage"
        echo ""
        echo "Maintenance:"
        echo "  logs [service]           Show logs for all services or specific service"
        echo "  update                   Update all containers to latest versions"
        echo "  rebuild                  Rebuild containers from source"
        echo "  health                   Run comprehensive health check"
        echo ""
        echo "Data Management:"
        echo "  backup                   Create backup of configuration and data"
        echo "  restore <backup_dir>     Restore from backup"
        echo "  clean                    Clean up unused Docker resources"
        echo "  reset                    Complete reset (removes all data)"
        echo ""
        echo "Examples:"
        echo "  $0 restart searxng       Restart just the search engine"
        echo "  $0 logs pihole           Show Pi-hole logs in real-time"
        echo "  $0 backup                Create backup before updates"
        echo "  $0 health                Check if everything is working"
        ;;
esac
```

## Firewall Configuration for Network Security

The firewall.sh script configures UFW (Uncomplicated Firewall) for optimal security:

```bash
#!/bin/bash
# Firewall Configuration for Privacy Hub
# This script configures UFW to provide secure access to services

echo "🔒 Configuring Privacy Hub Firewall..."

# Install UFW if not already installed
if ! command -v ufw &> /dev/null; then
    echo "📦 Installing UFW firewall..."
    sudo apt update
    sudo apt install -y ufw
fi

# Reset UFW to default state
echo "🔄 Resetting firewall to default configuration..."
sudo ufw --force reset

# Set default policies (deny incoming, allow outgoing)
echo "🛡️ Setting default security policies..."
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH access (essential for remote management)
echo "🔑 Allowing SSH access..."
sudo ufw allow ssh

# Allow DNS traffic (port 53) for Pi-hole
echo "🌐 Allowing DNS traffic..."
sudo ufw allow 53/tcp
sudo ufw allow 53/udp

# Allow HTTP traffic (port 80) - will redirect to HTTPS
echo "📡 Allowing HTTP traffic..."
sudo ufw allow 80/tcp

# Allow HTTPS traffic (port 443) for web interface
echo "🔐 Allowing HTTPS traffic..."
sudo ufw allow 443/tcp

# Optional: Restrict access to local network only
# Uncomment and adjust the network range for your setup
# echo "🏠 Restricting access to local network only..."
# sudo ufw allow from 192.168.1.0/24 to any port 22
# sudo ufw allow from 192.168.1.0/24 to any port 53
# sudo ufw allow from 192.168.1.0/24 to any port 80
# sudo ufw allow from 192.168.1.0/24 to any port 443

# Enable the firewall
echo "✅ Enabling firewall..."
sudo ufw --force enable

# Display current firewall status
echo ""
echo "🔒 Firewall Configuration Complete!"
echo "======================================"
sudo ufw status verbose

echo ""
echo "📋 Firewall Summary:"
echo "• SSH (22): Allowed for remote management"
echo "• DNS (53): Allowed for Pi-hole filtering"
echo "• HTTP (80): Allowed (redirects to HTTPS)"
echo "• HTTPS (443): Allowed for web interface"
echo "• All other ports: Blocked for security"
echo ""
echo "🔧 To modify firewall rules later:"
echo "  sudo ufw status          # View current rules"
echo "  sudo ufw allow 8080      # Allow specific port"
echo "  sudo ufw delete allow 80 # Remove rule"
echo "  sudo ufw disable         # Disable firewall"
```

## Environment Configuration

The .env file is automatically generated but can be customized:

```bash
# Privacy Hub Environment Configuration
# This file is automatically generated during setup

# Server IP address (auto-detected during setup)
SERVER_IP=192.168.1.100

# Timezone for logs and scheduling (adjust for your location)
TZ=Europe/Helsinki

# Pi-hole admin password (change this after setup!)
PIHOLE_PASSWORD=secure123

# Docker Compose project name (for resource isolation)
COMPOSE_PROJECT_NAME=privacy-hub

# Optional: Custom domain suffix for local services
LOCAL_DOMAIN=local
```

## Git Configuration for Version Control

The .gitignore file ensures sensitive data stays local:

```gitignore
# Ignore runtime data and logs
pihole/data/
searxng/data/
nginx/ssl/

# Ignore environment variables (may contain sensitive info)
.env

# Ignore backup files
backups/

# Ignore Docker volumes and temporary files
docker-compose.override.yml
*.log
*.tmp

# Keep configuration templates
!pihole/custom.list
!searxng/settings.yml
!nginx/nginx.conf

# Ignore IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Ignore OS-specific files
.DS_Store
Thumbs.db
```

## Router Configuration Guide

Configuring your router to use Pi-hole as the DNS server is crucial for network-wide ad blocking:

### Finding Your Router's Admin Interface

Most home routers use one of these addresses for their admin interface:
- http://192.168.1.1
- http://192.168.0.1  
- http://10.0.0.1

You can also find your router's IP by running this command on any connected device:
```bash
ip route | grep default
```

### Locating DNS Settings

Router interfaces vary, but DNS settings are typically found under:
- Network Settings → DHCP Settings
- Internet Settings → DNS Configuration  
- Advanced Settings → DNS Server
- LAN Setup → DHCP Server Settings

### Configuring DNS Servers

Set these values in your router's DNS configuration:
- Primary DNS Server: [Your Pi's IP address, e.g., 192.168.1.100]
- Secondary DNS Server: 1.1.1.1 (Cloudflare as backup)

Some routers have separate fields for IPv4 and IPv6. For IPv4, use the settings above. For IPv6, you can use:
- Primary: [Your Pi's IPv6 address if configured]
- Secondary: 2606:4700:4700::1111 (Cloudflare IPv6)

### Applying Changes

After changing DNS settings:
1. Save the configuration in your router
2. Restart your router (usually a "Reboot" option in the admin interface)
3. Wait 2-3 minutes for the router to fully restart
4. Test the configuration by visiting https://[your-pi-ip]/admin

### Verifying DNS Configuration

To verify that your devices are using Pi-hole for DNS resolution:

On Windows:
```cmd
nslookup google.com
```

On macOS/Linux:
```bash
dig google.com
```

The response should show your Pi's IP address as the DNS server.

## Testing and Verification

### Initial Testing Checklist

After completing the setup, verify everything works correctly:

1. **Web Interface Access**
   - Visit https://[your-pi-ip] - should show SearXNG search interface
   - Visit https://[your-pi-ip]/admin - should show Pi-hole admin (accept SSL warning)
   - Search for something on SearXNG - results should appear

2. **DNS Filtering Test**
   - Visit https://[your-pi-ip]/admin and note the "Queries Blocked Today" counter
   - Browse to some ad-heavy websites
   - Return to Pi-hole admin - the blocked counter should increase

3. **Ad Blocking Verification**
   - Test websites that typically show ads (news sites, etc.)
   - Ads should be noticeably reduced or eliminated
   - YouTube ads on smart TVs should be significantly reduced

4. **Service Health Check**
   - Run: `./scripts/manage.sh health`
   - All checks should pass

### Performance Testing

Monitor your Pi's performance to ensure everything runs smoothly:

```bash
# Check CPU and memory usage
./scripts/manage.sh status

# Monitor real-time resource usage  
htop

# Check disk space usage
df -h

# Test DNS response times
dig google.com @[your-pi-ip]
```

### Troubleshooting Common Issues

**Issue: SSL Certificate Warnings**
- This is normal with self-signed certificates
- Click "Advanced" → "Proceed to [IP] (unsafe)" in your browser
- The connection is still encrypted, just not verified by a commercial CA

**Issue: Pi-hole Admin Interface Shows No Data**
- Wait 10-15 minutes after setup for data to accumulate
- Ensure devices are actually using Pi-hole for DNS
- Check router DNS configuration

**Issue: Search Engine Not Loading**
- Verify SearXNG container is running: `docker-compose ps`
- Check logs: `./scripts/manage.sh logs searxng`
- Restart the service: `./scripts/manage.sh restart searxng`

**Issue: DNS Not Working**
- Verify Pi-hole container is running and healthy
- Check that port 53 is not blocked by firewall
- Test DNS directly: `nslookup google.com [your-pi-ip]`

## Maintenance and Updates

### Regular Maintenance Tasks

**Weekly:**
- Check service status: `./scripts/manage.sh status`
- Review Pi-hole blocking statistics
- Verify all services are running properly

**Monthly:**
- Update containers: `./scripts/manage.sh update`
- Create backup: `./scripts/manage.sh backup`
- Check disk space usage: `df -h`
- Review and clean up logs if needed

**Quarterly:**
- Review and update blocklists in Pi-hole admin
- Check for Raspberry Pi OS updates: `sudo apt update && sudo apt upgrade`
- Test disaster recovery by restoring from backup

### Updating the System

The Docker-based approach makes updates simple and safe:

```bash
# Update all containers to latest versions
./scripts/manage.sh update

# Rebuild containers from source (if you've modified Dockerfiles)
./scripts/manage.sh rebuild

# Update the host OS (Raspberry Pi OS)
sudo apt update && sudo apt upgrade -y
```

### Backup and Recovery

**Creating Backups:**
```bash
# Create a timestamped backup
./scripts/manage.sh backup

# Backups are stored in ./backups/ directory
ls -la backups/
```

**Restoring from Backup:**
```bash
# List available backups
ls backups/

# Restore from a specific backup
./scripts/manage.sh restore backups/20231201_120000
```

### Monitoring and Alerts

For advanced users who want monitoring, consider setting up:

**Basic Monitoring:**
- Create a simple cron job to check service health
- Set up email alerts for service failures
- Monitor disk space to prevent SD card full conditions

**Advanced Monitoring:**
- Integrate with Prometheus and Grafana for detailed metrics
- Set up log aggregation with ELK stack
- Configure automated alerting with tools like Alertmanager

## Sharing with Others

### Preparing for Distribution

Before sharing your setup with neighbors or friends:

1. **Clean the Repository:**
   ```bash
   # Remove any personal data
   rm -rf pihole/data/* searxng/data/*
   
   # Reset environment file
   echo "SERVER_IP=auto-detect" > .env
   ```

2. **Create Documentation:**
   - Include any custom configurations you've made
   - Document any specific requirements for your network setup
   - Create a simple quick-start guide

3. **Test the Deployment:**
   ```bash
   # Test clean deployment
   ./scripts/manage.sh reset
   ./scripts/setup.sh
   ```

### GitHub Repository Setup

Create a public repository to share your setup:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial Privacy Hub setup"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/privacy-hub.git

# Push to GitHub
git push -u origin main
```

### Quick Deployment for Others

Anyone can deploy your setup with these simple commands:

```bash
# Clone the repository
git clone https://github.com/yourusername/privacy-hub.git
cd privacy-hub

# Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configure router DNS to point to the Pi's IP address
# Done!
```

## Advanced Customizations

### Adding Additional Services

The modular Docker architecture makes it easy to add new services:

1. **Create a new service directory** (e.g., `service-name/`)
2. **Add a Dockerfile** with your service configuration
3. **Update docker-compose.yml** to include the new service
4. **Add routing rules** to nginx.conf if web access is needed
5. **Update management scripts** to handle the new service

### Customizing Blocklists

Pi-hole's effectiveness can be enhanced with additional blocklists:

1. **Access Pi-hole admin** at https://[pi-ip]/admin
2. **Navigate to Group Management → Adlists**
3. **Add specialized blocklists** for your needs:
   - Gaming: Block gaming-related ads and trackers
   - Social Media: Block social media trackers
   - Streaming: Block streaming service ads
   - IoT: Block telemetry from smart devices

### Performance Optimization

For optimal performance on Raspberry Pi:

**CPU Optimization:**
- Adjust nginx worker processes: `worker_processes 1;` for Pi Zero, `auto` for Pi 4
- Tune Docker resource limits in docker-compose.yml
- Consider using lighter alternatives for resource-constrained setups

**Memory Optimization:**
- Increase tmpfs usage to reduce SD card writes
- Configure swap file appropriately for your Pi model
- Monitor memory usage and adjust container limits

**Storage Optimization:**
- Use USB SSD instead of SD card for better performance and longevity
- Configure log rotation to prevent disk space issues
- Regularly clean up Docker images and containers

## Security Considerations

### Network Security

This setup provides multiple layers of security:

**Perimeter Security:**
- UFW firewall blocks unnecessary ports
- Only essential services (DNS, HTTP, HTTPS) are exposed
- SSH access for management only

**Application Security:**
- nginx reverse proxy validates and filters requests
- Internal services are isolated and not directly accessible
- Self-signed SSL certificates encrypt local traffic

**Container Security:**
- Each service runs in isolated containers
- Services run with minimal privileges
- No root access required for normal operation

### Privacy Protection

The setup maximizes privacy through:

**DNS Privacy:**
- All DNS queries filtered locally before reaching external servers
- No logging of DNS queries to protect browsing privacy
- Upstream DNS uses privacy-focused providers (Cloudflare)

**Search Privacy:**
- SearXNG strips tracking from search results
- No search history logging or storage
- Multiple search engines aggregated without user profiling

**Data Minimization:**
- Logs stored in RAM only (lost on restart)
- Minimal persistent data storage
- No unnecessary data collection or retention

### Best Practices

**Regular Security Updates:**
- Keep Docker containers updated
- Update Raspberry Pi OS regularly
- Monitor security advisories for used software

**Access Control:**
- Use strong passwords for all admin interfaces
- Consider implementing additional authentication layers
- Restrict SSH access to known IP addresses if possible

**Monitoring:**
- Regularly review service logs for anomalies
- Monitor network traffic for unusual patterns
- Set up alerting for service failures

## Conclusion

You have successfully created a professional-grade network privacy and security appliance using a Raspberry Pi and modern container orchestration techniques. This setup provides comprehensive protection for your entire network while maintaining ease of use and management.

The architecture you've built mirrors enterprise-level infrastructure patterns, using reverse proxies, container isolation, and defense-in-depth security principles. Your parents will enjoy seamless ad-blocking and private search capabilities, while you maintain a system that's both powerful and maintainable.

The modular Docker design ensures that your setup can evolve over time, adding new privacy tools or security features as needed. The comprehensive management scripts make maintenance straightforward, whether you're updating services, troubleshooting issues, or sharing the setup with others.

Most importantly, this project gives you complete control over your network's privacy and security. Unlike commercial solutions that may collect data or have hidden vulnerabilities, your Privacy Hub operates entirely under your control, with full transparency and customization capabilities.

Your journey from concept to implementation demonstrates the power of combining open-source tools, containerization, and sound architectural principles to create something truly valuable. The skills and patterns you've learned here can be applied to many other home lab projects and professional endeavors.

Welcome to the world of self-hosted privacy infrastructure - you've built something remarkable!