#!/bin/bash
# SSL Certificate Upgrade Script
# Upgrades from self-signed to mkcert trusted certificates

set -e

echo "🔒 SSL Certificate Upgrade Tool"
echo "================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Configuration not found! Run ./scripts/configure.sh first"
    exit 1
fi

# Load environment variables
source .env

# Check if mkcert is installed
if ! command -v mkcert >/dev/null 2>&1; then
    echo "❌ mkcert not found!"
    echo ""
    echo "📋 Install mkcert first:"
    echo "   Pi: curl -JLO 'https://dl.filippo.io/mkcert/latest?for=linux/arm64'"
    echo "       chmod +x mkcert-v*-linux-arm64"
    echo "       sudo mv mkcert-v*-linux-arm64 /usr/local/bin/mkcert"
    echo "       mkcert -install"
    echo ""
    echo "   Computer: https://github.com/FiloSottile/mkcert#installation"
    exit 1
fi

echo "📍 Current configuration:"
echo "   Server IP: $SERVER_IP"
echo "   Hostname: $HOSTNAME.$LOCAL_DOMAIN"

# Backup existing certificates
if [ -f "nginx/ssl/nginx.crt" ]; then
    echo "📦 Backing up existing certificates..."
    cp nginx/ssl/nginx.crt nginx/ssl/nginx.crt.backup
    cp nginx/ssl/nginx.key nginx/ssl/nginx.key.backup
fi

# Generate new mkcert certificates
echo "🔐 Generating trusted SSL certificates..."
cd nginx/ssl
mkcert -key-file nginx.key -cert-file nginx.crt \
    "$HOSTNAME.$LOCAL_DOMAIN" \
    "$SERVER_IP" \
    localhost \
    127.0.0.1 \
    "::1"
cd ../..

echo "🔄 Restarting nginx..."
docker compose restart nginx

echo ""
echo "✅ SSL Certificate Upgrade Complete!"
echo ""
echo "🎉 Benefits:"
echo "   • No more browser security warnings"
echo "   • Automatically trusted certificates"
echo "   • Professional browsing experience"
echo ""
echo "🌐 Test your sites:"
echo "   • https://$HOSTNAME.$LOCAL_DOMAIN"
echo "   • https://$SERVER_IP"
echo ""
echo "💡 Share with others: They need mkcert installed on their computers too!"