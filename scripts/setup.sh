#!/bin/bash
# Setup script - no hardcoded IPs needed!

echo "Setting up Privacy Hub..."

# Create directories
mkdir -p pihole/{data,dnsmasq}
mkdir -p searxng/data
mkdir -p nginx/ssl

# Generate random secret for SearXNG
RANDOM_SECRET=$(openssl rand -hex 32)
sed -i "s/CHANGE_ME_TO_RANDOM_50_CHARS/$RANDOM_SECRET/" searxng/settings.yml

# Detect local IP automatically
LOCAL_IP=$(hostname -I | cut -d' ' -f1)
echo "SERVER_IP=$LOCAL_IP" > .env
echo "Detected IP: $LOCAL_IP"

# Build and start services
echo "Building containers..."
docker-compose build

echo "Starting services..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

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