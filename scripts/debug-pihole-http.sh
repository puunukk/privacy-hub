#!/bin/bash
# Pi-hole HTTP Server Debug Script

echo "🕳️ Pi-hole HTTP Server Deep Debug"
echo "================================="

echo "📋 Pi-hole Container Details:"
docker exec pihole cat /etc/os-release | head -3

echo ""
echo "🔍 Pi-hole HTTP Server Status:"
echo "Checking if lighttpd is running:"
docker exec pihole pgrep -f lighttpd || echo "lighttpd not found"

echo ""
echo "Checking Pi-hole web server processes:"
docker exec pihole ps aux | grep -E "(lighttpd|php|www)" | grep -v grep

echo ""
echo "🌐 Network Binding Check:"
echo "Checking what's listening on port 80:"
docker exec pihole ss -tlnp | grep :80 || docker exec pihole netstat -tlnp | grep :80 || echo "No port 80 listeners found"

echo ""
echo "🔧 Pi-hole Configuration Files:"
echo "Checking lighttpd config:"
docker exec pihole ls -la /etc/lighttpd/ 2>/dev/null || echo "lighttpd config dir not found"

echo "Checking for alternative web servers:"
docker exec pihole ls -la /etc/nginx/ 2>/dev/null && echo "nginx found" || echo "nginx not found"
docker exec pihole ls -la /etc/apache2/ 2>/dev/null && echo "apache found" || echo "apache not found"

echo ""
echo "📂 Pi-hole Web Directory:"
docker exec pihole ls -la /var/www/html/admin/ | head -5

echo ""
echo "🔍 Direct HTTP Tests:"
echo "Testing localhost inside Pi-hole container:"
docker exec pihole curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/admin/ 2>/dev/null || echo "curl not available"

echo "Testing 127.0.0.1 inside Pi-hole container:"
docker exec pihole curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://127.0.0.1/admin/ 2>/dev/null || echo "curl not available"

echo "Testing 0.0.0.0 binding:"
docker exec pihole curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://0.0.0.0/admin/ 2>/dev/null || echo "curl not available"

echo ""
echo "🔧 Pi-hole Service Status:"
echo "Pi-hole status check:"
docker exec pihole pihole status || echo "pihole command not available"

echo ""
echo "Pi-hole version:"
docker exec pihole pihole version || echo "pihole version command not available"

echo ""
echo "🔍 Container Environment:"
docker exec pihole env | grep -E "(VIRTUAL_HOST|WEB)" | sort

echo ""
echo "🚀 Restart Suggestion:"
echo "If HTTP server issues found, try:"
echo "  docker exec pihole service lighttpd restart"
echo "  # or"  
echo "  ./scripts/manage.sh restart pihole"