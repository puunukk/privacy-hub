#!/bin/bash
# Configuration script - generates .env file and handles user-specific settings

set -e

echo "🔧 Configuring Privacy Hub..."

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    read -p "$prompt [$default]: " input
    if [ -z "$input" ]; then
        export $var_name="$default"
    else
        export $var_name="$input"
    fi
}

# Auto-detect local IP
LOCAL_IP=$(hostname -I | cut -d' ' -f1)
echo "📍 Detected IP address: $LOCAL_IP"

# Get configuration values
echo ""
echo "📝 Configuration Setup (press Enter for defaults):"

prompt_with_default "Pi hostname" "otsi" HOSTNAME
prompt_with_default "Local domain" "local" LOCAL_DOMAIN
prompt_with_default "Timezone" "Europe/Tallinn" TZ
# prompt_with_default "Pi-hole admin password" "secure123" PIHOLE_PASSWORD
# Generate a secure random password
AUTO_PASSWORD=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-10)
prompt_with_default "Pi-hole admin password" "$AUTO_PASSWORD" PIHOLE_PASSWORD

if [ "$PIHOLE_PASSWORD" = "$AUTO_PASSWORD" ]; then
    echo "✅ Using auto-generated secure password: $AUTO_PASSWORD"
else
    echo "✅ Using custom password"
fi

# Generate SearXNG secret key
SEARXNG_SECRET_KEY=$(openssl rand -hex 32)

# SearXNG configuration with defaults
prompt_with_default "SearXNG theme (simple/oscar/pix-art)" "simple" SEARXNG_DEFAULT_THEME
prompt_with_default "SearXNG safe search (0=off, 1=moderate, 2=strict)" "1" SEARXNG_SAFE_SEARCH  
prompt_with_default "SearXNG default language" "en" SEARXNG_DEFAULT_LANG

# Generate .env file
echo ""
echo "📄 Creating .env file..."

cat > .env << EOF
# Privacy Hub Environment Configuration
# Generated on $(date)

# Server configuration
SERVER_IP=$LOCAL_IP

# Timezone for logs and scheduling
TZ=$TZ

# Pi-hole admin password
PIHOLE_PASSWORD=$PIHOLE_PASSWORD

# SearXNG Configuration
SEARXNG_SECRET_KEY=$SEARXNG_SECRET_KEY
SEARXNG_DEFAULT_THEME=$SEARXNG_DEFAULT_THEME
SEARXNG_SAFE_SEARCH=$SEARXNG_SAFE_SEARCH
SEARXNG_DEFAULT_LANG=$SEARXNG_DEFAULT_LANG

# Hostname settings for local access
HOSTNAME=$HOSTNAME
LOCAL_DOMAIN=$LOCAL_DOMAIN

# Docker Compose project name
COMPOSE_PROJECT_NAME=privacy-hub
EOF

echo "✅ Configuration complete!"
echo ""
echo "📋 Your settings:"
echo "   • Access URL: https://$HOSTNAME.$LOCAL_DOMAIN (or https://$LOCAL_IP)"
echo "   • Pi-hole admin: https://$HOSTNAME.$LOCAL_DOMAIN/admin"
echo "   • Admin password: $PIHOLE_PASSWORD"
echo ""
echo "🚀 Ready to run: ./scripts/setup.sh"