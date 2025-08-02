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

# Check Docker networks
echo "📋 Docker Networks:"
docker network ls | grep privacy-hub

echo ""
echo "📋 Container Network Assignments:"
docker inspect privacy-hub-nginx | jq -r '.[] | .NetworkSettings.Networks | keys[]' 2>/dev/null || echo "nginx: network info unavailable"
docker inspect privacy-hub-pihole | jq -r '.[] | .NetworkSettings.Networks | keys[]' 2>/dev/null || echo "pihole: network info unavailable"  
docker inspect privacy-hub-searxng | jq -r '.[] | .NetworkSettings.Networks | keys[]' 2>/dev/null || echo "searxng: network info unavailable"

echo ""
echo "🔍 Hostname Resolution Tests:"
# Test if nginx can reach pihole
if docker compose ps | grep -q "nginx.*Up"; then
    echo "✅ NGINX container is running"
    if docker exec nginx nslookup pihole >/dev/null 2>&1; then
        echo "✅ NGINX can resolve pihole hostname"
    else
        echo "❌ NGINX cannot resolve pihole hostname"
        echo "   Trying IP resolution..."
        docker exec nginx getent hosts pihole || echo "   No pihole host entry found"
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
        echo "   Trying IP resolution..."
        docker exec nginx getent hosts searxng || echo "   No searxng host entry found"
    fi
else
    echo "❌ SearXNG container not running"
fi

echo ""
echo "🔍 Direct Connectivity Tests:"
if docker compose ps | grep -q "nginx.*Up" && docker compose ps | grep -q "pihole.*Up"; then
    echo "Testing direct HTTP connectivity..."
    if docker exec nginx wget -q --spider http://pihole:80 2>/dev/null; then
        echo "✅ NGINX can reach Pi-hole HTTP interface"
    else
        echo "❌ NGINX cannot reach Pi-hole HTTP interface"
    fi
fi

if docker compose ps | grep -q "nginx.*Up" && docker compose ps | grep -q "searxng.*Up"; then
    if docker exec nginx wget -q --spider http://searxng:8080 2>/dev/null; then
        echo "✅ NGINX can reach SearXNG interface"
    else
        echo "❌ NGINX cannot reach SearXNG interface"
    fi
fi

echo ""
echo "🔑 Access Information:"
echo "   🔍 Search: https://$HOSTNAME.$LOCAL_DOMAIN (or https://$SERVER_IP)"
echo "   🛡️ Pi-hole Admin: https://$HOSTNAME.$LOCAL_DOMAIN/pihole/admin"
echo "   🔑 Pi-hole Password: $PIHOLE_PASSWORD"

echo ""
echo "🔧 Quick Fixes:"
echo "   Password issues: ./scripts/manage.sh password"
echo "   SSL warnings: ./scripts/manage.sh ssl"
echo "   Restart all: ./scripts/manage.sh restart"