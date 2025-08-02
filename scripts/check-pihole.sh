#!/bin/bash
# Pi-hole Specific Diagnostic Script

echo "🕳️ Pi-hole Deep Diagnostic"
echo "========================="

# Check Pi-hole container status
echo "📋 Pi-hole Container Status:"
docker compose ps pihole

echo ""
echo "🔍 Pi-hole Health Check:"
docker inspect privacy-hub-pihole | grep -A 5 -B 5 Health || echo "No health info available"

echo ""
echo "📋 Pi-hole Process Status:"
docker exec pihole ps aux | grep -E "(lighttpd|dnsmasq|pihole)" || echo "Process check failed"

echo ""
echo "🌐 Pi-hole Port Status:"
docker exec pihole netstat -tlnp | grep -E ":80|:53" || echo "Port check failed"

echo ""
echo "📂 Pi-hole Web Files:"
docker exec pihole ls -la /var/www/html/admin/ | head -5

echo ""
echo "🔧 Pi-hole Configuration:"
docker exec pihole cat /etc/lighttpd/lighttpd.conf | grep -E "(server.bind|server.port)" || echo "Config check failed"

echo ""
echo "📝 Pi-hole Logs (last 10 lines):"
docker exec pihole tail -10 /var/log/pihole.log 2>/dev/null || echo "Log check failed"

echo ""
echo "🌐 Direct HTTP Test from Container:"
if docker exec pihole curl -s -o /dev/null -w "%{http_code}" http://localhost:80/admin/; then
    echo "✅ Pi-hole web server responds locally"
else
    echo "❌ Pi-hole web server not responding locally"
fi

echo ""
echo "🔍 External HTTP Test:"
if curl -s -o /dev/null -w "%{http_code}" http://192.168.1.120:80/admin/ 2>/dev/null | grep -q "200"; then
    echo "✅ Pi-hole accessible externally (direct)"
else
    echo "❌ Pi-hole not accessible externally"
fi

echo ""
echo "🔄 Restart Suggestions:"
echo "If Pi-hole web server isn't responding:"
echo "  ./scripts/manage.sh restart pihole"
echo "  # Wait 30 seconds then test again"