#!/bin/bash
# Pi-hole Password Reset Script

set -e

echo "🔑 Pi-hole Password Management"
echo "=============================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Configuration not found! Run ./scripts/configure.sh first"
    exit 1
fi

# Load environment variables
source .env

echo "📋 Current password in .env: $PIHOLE_PASSWORD"

# Check if container is running
if ! docker compose ps | grep -q "pihole.*Up"; then
    echo "❌ Pi-hole container is not running!"
    echo "   Start it with: ./scripts/manage.sh start"
    exit 1
fi

echo ""
echo "🔧 Password Reset Options:"
echo "1. Use password from .env file ($PIHOLE_PASSWORD)"
echo "2. Set new password"
echo "3. Check current container password"

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "🔄 Setting password to: $PIHOLE_PASSWORD"
        docker exec pihole pihole -a -p "$PIHOLE_PASSWORD"
        ;;
    2)
        read -s -p "Enter new password: " NEW_PASSWORD
        echo ""
        read -s -p "Confirm password: " CONFIRM_PASSWORD
        echo ""
        
        if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
            echo "❌ Passwords don't match!"
            exit 1
        fi
        
        echo "🔄 Setting new password..."
        docker exec pihole pihole -a -p "$NEW_PASSWORD"
        
        # Update .env file
        sed -i "s/PIHOLE_PASSWORD=.*/PIHOLE_PASSWORD=$NEW_PASSWORD/" .env
        echo "✅ Password updated in .env file"
        ;;
    3)
        echo "🔍 Checking container environment..."
        docker exec pihole env | grep -E "(WEBPASSWORD|PIHOLE)" || echo "No password environment variables found"
        
        echo ""
        echo "🔍 Checking Pi-hole admin password status..."
        docker exec pihole pihole -a -p
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Password operation complete!"
echo ""
echo "🌐 Test login at: https://$HOSTNAME.$LOCAL_DOMAIN/admin"
echo "🔑 Username: (leave blank)"
echo "🔑 Password: $PIHOLE_PASSWORD"
echo ""
echo "💡 If login still fails, restart the container:"
echo "   ./scripts/manage.sh restart pihole"