#!/bin/bash
# Setup script - deploys Privacy Hub containers

set -e

echo "🚀 Setting up Privacy Hub..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Configuration not found!"
    echo "   Run: ./scripts/configure.sh first"
    exit 1
fi

# Load environment variables
source .env

echo "📍 Using server IP: $SERVER_IP"
echo "🏷️  Using hostname: $HOSTNAME (accessible as $HOSTNAME.$LOCAL_DOMAIN)"

# Create directories
echo "📁 Creating directories..."
mkdir -p pihole/{data,dnsmasq}
mkdir -p searxng/data
mkdir -p nginx/ssl

# Generate SSL certificates for nginx
echo "🔒 Setting up SSL certificates..."
if [ ! -f "nginx/ssl/nginx.crt" ]; then
    # Try to use mkcert for locally trusted certificates first
    if command -v mkcert >/dev/null 2>&1; then
        echo "📋 Using mkcert for locally trusted certificates..."
        cd nginx/ssl
        mkcert -key-file nginx.key -cert-file nginx.crt \
            "$HOSTNAME.$LOCAL_DOMAIN" \
            "$SERVER_IP" \
            localhost \
            127.0.0.1 \
            "::1" >/dev/null 2>&1
        cd ../..
        echo "✅ Locally trusted SSL certificates generated"
        echo "💡 No browser warnings! Certificates are automatically trusted."
    else
        echo "📋 mkcert not found, using self-signed certificates..."
        echo "💡 Install mkcert for browser-trusted certificates: https://github.com/FiloSottile/mkcert"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/nginx.key \
            -out nginx/ssl/nginx.crt \
            -subj "/C=FI/ST=State/L=City/O=Home/CN=*.$LOCAL_DOMAIN" \
            >/dev/null 2>&1
        echo "✅ Self-signed SSL certificates generated"
        echo "⚠️  Browser will show security warning (click Advanced → Proceed)"
    fi
else
    echo "✅ SSL certificates already exist"
fi

# Set proper permissions first
echo "🔧 Setting permissions..."
if command -v sudo >/dev/null 2>&1; then
    sudo chown -R $USER:$USER pihole/ nginx/ searxng/ || true
    # SearXNG data directory will be set after file copy
else
    chown -R $USER:$USER pihole/ nginx/ searxng/ || true
fi

# Generate random secret for SearXNG
echo "🔐 Configuring SearXNG..."
RANDOM_SECRET=$(openssl rand -hex 32)

# Create settings.yml in the data directory
cp searxng/settings.yml searxng/data/settings.yml
sed -i "s/CHANGE_ME_TO_RANDOM_50_CHARS/$RANDOM_SECRET/" searxng/data/settings.yml

# Set SearXNG permissions after file operations
echo "🔧 Setting SearXNG container permissions..."
if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 977:977 searxng/data/
else
    chown -R 977:977 searxng/data/
fi

# Build and start services
echo "Building containers..."
docker compose build

echo "Starting services..."
docker compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check if containers are running
echo "Checking container status..."
docker compose ps

# Show any immediate errors
echo "Checking for startup errors..."
docker compose logs --tail=20

echo ""
echo "🎉 Privacy Hub is ready!"
echo ""
echo "🔍 Search (Homepage): https://$HOSTNAME.$LOCAL_DOMAIN (or https://$SERVER_IP)"
echo "🛡️ Pi-hole Admin: https://$HOSTNAME.$LOCAL_DOMAIN/admin (or https://$SERVER_IP/admin)"
echo "❤️ Health Check: https://$HOSTNAME.$LOCAL_DOMAIN/health (or https://$SERVER_IP/health)"
echo "🔑 Pi-hole Password: $PIHOLE_PASSWORD"
echo ""
echo "⚠️  SSL Warning: Accept the self-signed certificate in your browser"
echo ""
echo "📝 Configure your router:"
echo "   1. Set DHCP reservation for this Pi's MAC to: $SERVER_IP"
echo "   2. Set router DNS to: $SERVER_IP"
echo ""
echo "🔧 Management:"
echo "   ./scripts/manage.sh status     # Check status"
echo "   ./scripts/manage.sh logs       # View logs" 
echo "   ./scripts/manage.sh restart    # Restart services" 