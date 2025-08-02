#!/bin/bash
# Setup script - no hardcoded IPs needed!

echo "Setting up Privacy Hub..."

# Create directories
mkdir -p pihole/{data,dnsmasq}
mkdir -p searxng/data
mkdir -p nginx/ssl

# Generate SSL certificates for nginx (since volume mount overrides container certs)
echo "Generating SSL certificates..."
if [ ! -f "nginx/ssl/nginx.crt" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/nginx.key \
        -out nginx/ssl/nginx.crt \
        -subj "/C=FI/ST=State/L=City/O=Home/CN=*.local" \
        >/dev/null 2>&1
    echo "✅ SSL certificates generated"
else
    echo "✅ SSL certificates already exist"
fi

# Generate random secret for SearXNG and create settings in data directory
RANDOM_SECRET=$(openssl rand -hex 32)

# Create settings.yml in the data directory (which gets mounted to container)
cp searxng/settings.yml searxng/data/settings.yml
sed -i "s/CHANGE_ME_TO_RANDOM_50_CHARS/$RANDOM_SECRET/" searxng/data/settings.yml

# Set proper permissions for all data directories
echo "Setting up permissions..."

# SearXNG container runs as UID 977 (searxng user)
if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 977:977 searxng/data/
    # Ensure other directories are accessible
    sudo chown -R $USER:$USER pihole/ nginx/ || true
else
    chown -R 977:977 searxng/data/
    chown -R $USER:$USER pihole/ nginx/ || true
fi

# Detect local IP automatically
LOCAL_IP=$(hostname -I | cut -d' ' -f1)
echo "SERVER_IP=$LOCAL_IP" > .env
echo "Detected IP: $LOCAL_IP"

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
echo "🔍 Search (Homepage): https://otsi.local (or https://$LOCAL_IP)"
echo "🛡️ Pi-hole Admin: https://otsi.local/admin"
echo "❤️ Health Check: https://otsi.local/health"
echo ""
echo "⚠️  SSL Warning: Accept the self-signed certificate in your browser"
echo ""
echo "📝 Configure your router:"
echo "   1. Set DHCP reservation for this Pi's MAC to: $LOCAL_IP"
echo "   2. Set router DNS to: $LOCAL_IP"
echo ""
echo "🔧 Management: ./scripts/manage.sh restart searxng" 