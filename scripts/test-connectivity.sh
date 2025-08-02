#!/bin/bash
# Deep Connectivity Test Script

echo "🔗 Deep Connectivity Analysis"
echo "============================"

echo "📋 Container IP Information:"
echo "NGINX IP:"
docker inspect nginx | grep '"IPAddress"' | head -1

echo "Pi-hole IP:"
docker inspect pihole | grep '"IPAddress"' | head -1

echo "SearXNG IP:"
docker inspect searxng | grep '"IPAddress"' | head -1

echo ""
echo "🌐 Network Bridge Information:"
docker network inspect privacy-hub_internal

echo ""
echo "🔍 Direct Connection Tests from NGINX:"

echo "Testing Pi-hole on various ports..."
docker exec nginx nc -zv 172.18.0.2 80 2>&1 || echo "Port 80 failed"
docker exec nginx nc -zv 172.18.0.2 53 2>&1 || echo "Port 53 failed"
docker exec nginx nc -zv pihole 80 2>&1 || echo "pihole:80 hostname failed"

echo ""
echo "Testing SearXNG..."
docker exec nginx nc -zv 172.18.0.3 8080 2>&1 || echo "SearXNG port 8080 failed"
docker exec nginx nc -zv searxng 8080 2>&1 || echo "searxng:8080 hostname failed"

echo ""
echo "🔍 HTTP Response Tests:"
echo "Testing Pi-hole HTTP response directly:"
docker exec nginx curl -v -m 5 http://172.18.0.2:80/admin/ 2>&1 | head -20

echo ""
echo "Testing SearXNG HTTP response:"
docker exec nginx curl -v -m 5 http://172.18.0.3:8080/ 2>&1 | head -10

echo ""
echo "🕳️ Pi-hole Internal Status:"
echo "Pi-hole processes inside container:"
docker exec pihole ps aux | grep -E "(lighttpd|php|nginx|apache)"

echo ""
echo "Pi-hole network listening ports:"
docker exec pihole netstat -tlnp 2>/dev/null | grep -E ":80|:53" || echo "netstat not available, trying ss..."
docker exec pihole ss -tlnp 2>/dev/null | grep -E ":80|:53" || echo "ss not available"

echo ""
echo "🔧 DNS Resolution from inside containers:"
echo "From NGINX container:"
docker exec nginx nslookup pihole 2>&1
echo "From Pi-hole container:"
docker exec pihole nslookup searxng 2>&1 || echo "nslookup not available in pihole"

echo ""
echo "📋 Container health summary:"
docker compose ps