#!/bin/bash
# Privacy Hub Diagnostic Script

echo "🔍 Privacy Hub Diagnostics"
echo "========================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Run: ./scripts/configure.sh"
    exit 1
fi

# Load and show environment variables
echo "📋 Environment Configuration:"
source .env
echo "   SERVER_IP: $SERVER_IP"
echo "   HOSTNAME: $HOSTNAME"
echo "   LOCAL_DOMAIN: $LOCAL_DOMAIN"
echo "   PIHOLE_PASSWORD: $PIHOLE_PASSWORD"
echo "   TZ: $TZ"

echo ""
echo "🐳 Docker Container Status:"
docker compose ps

echo ""
echo "🔧 Container Environment Variables:"
if docker compose ps | grep -q "pihole.*Up"; then
    echo "Pi-hole container environment:"
    docker exec pihole env | grep -E "(WEBPASSWORD|TZ|VIRTUAL_HOST|SERVER_IP)" | sort
else
    echo "❌ Pi-hole container not running"
fi

echo ""
echo "🌐 Network Tests:"
echo "Testing internal connectivity..."

# Test if nginx can reach pihole
if docker compose ps | grep -q "nginx.*Up"; then
    echo "✅ NGINX container is running"
    if docker exec nginx nslookup pihole >/dev/null 2>&1; then
        echo "✅ NGINX can resolve pihole hostname"
    else
        echo "❌ NGINX cannot resolve pihole hostname"
    fi
else
    echo "❌ NGINX container not running"
fi

# Test if nginx can reach searxng
if docker compose ps | grep -q "searxng.*Up"; then
    echo "✅ SearXNG container is running"
    if docker exec nginx nslookup searxng >/dev/null 2>&1; then
        echo "✅ NGINX can resolve searxng hostname"
    else
        echo "❌ NGINX cannot resolve searxng hostname"
    fi
else
    echo "❌ SearXNG container not running"
fi

echo ""
echo "🔑 Access Information:"
echo "   🔍 Search: https://$HOSTNAME.$LOCAL_DOMAIN (or https://$SERVER_IP)"
echo "   🛡️ Pi-hole Admin: https://$HOSTNAME.$LOCAL_DOMAIN/admin"
echo "   🔑 Pi-hole Password: $PIHOLE_PASSWORD"

echo ""
echo "🔧 Quick Fixes:"
echo "   Password issues: ./scripts/manage.sh password"
echo "   SSL warnings: ./scripts/manage.sh ssl"
echo "   Restart all: ./scripts/manage.sh restart"