#!/bin/bash
# Docker Network Repair Script

set -e

echo "🌐 Docker Network Repair Tool"
echo "============================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Configuration not found! Run ./scripts/configure.sh first"
    exit 1
fi

# Load environment variables
source .env

echo "📋 Current network status:"
echo "Container status:"
docker compose ps

echo ""
echo "📋 Docker networks:"
docker network ls | grep -E "(privacy-hub|NETWORK)"

echo ""
echo "🔧 Network Repair Options:"
echo "1. Restart containers (preserves data)"
echo "2. Full network reset (complete rebuild)"
echo "3. Just restart networking (quick fix)"

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "🔄 Restarting all containers..."
        docker compose down
        docker compose up -d
        sleep 10
        ;;
    2)
        echo "🔄 Full network reset..."
        docker compose down
        
        # Remove old networks
        docker network ls | grep privacy-hub | awk '{print $1}' | xargs -r docker network rm || true
        
        # Rebuild everything
        docker compose build --no-cache
        docker compose up -d
        sleep 15
        ;;
    3)
        echo "🔄 Quick network restart..."
        docker compose restart nginx
        sleep 5
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🔍 Testing network connectivity..."

# Wait for containers to be ready
sleep 5

# Test connectivity
echo "Testing NGINX → Pi-hole connectivity:"
if docker exec nginx nslookup pihole >/dev/null 2>&1; then
    echo "✅ NGINX can resolve pihole hostname"
else
    echo "❌ NGINX still cannot resolve pihole hostname"
    echo "   Manual fix needed - check Docker logs:"
    echo "   docker compose logs nginx"
    echo "   docker compose logs pihole"
fi

echo ""
echo "Testing NGINX → SearXNG connectivity:"
if docker exec nginx nslookup searxng >/dev/null 2>&1; then
    echo "✅ NGINX can resolve searxng hostname"
else
    echo "❌ NGINX still cannot resolve searxng hostname"
fi

echo ""
echo "🌐 Testing external access:"
LOCAL_IP=$(hostname -I | cut -d' ' -f1)
if curl -k -s -o /dev/null -w "%{http_code}" "https://localhost/health" | grep -q "200"; then
    echo "✅ HTTPS health check working"
elif curl -s -o /dev/null -w "%{http_code}" "http://localhost/health" | grep -q "200"; then
    echo "✅ HTTP health check working (HTTPS may need setup)"
else
    echo "❌ Health check failing - services not accessible"
fi

echo ""
echo "🔑 Testing Pi-hole admin access:"
if curl -k -s -o /dev/null -w "%{http_code}" "https://localhost/pihole/admin" | grep -q "200"; then
    echo "✅ Pi-hole admin interface accessible"
    echo "   Try login at: https://$HOSTNAME.$LOCAL_DOMAIN/pihole/admin"
    echo "   Password: $PIHOLE_PASSWORD"
else
    echo "❌ Pi-hole admin interface not accessible"
fi

echo ""
echo "✅ Network repair complete!"
echo ""
echo "🧪 Next steps:"
echo "1. Run ./scripts/diagnose.sh to verify all fixes"
echo "2. Test login at https://$HOSTNAME.$LOCAL_DOMAIN/pihole/admin"
echo "3. If still failing, check logs: ./scripts/manage.sh logs"