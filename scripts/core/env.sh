#!/bin/bash
# Environment management utilities

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/prompts.sh"
source "$SCRIPT_DIR/../utils/validation.sh"

# Load environment variables
load_env() {
    if [ -f ".env" ]; then
        set -a  # automatically export all variables
        source .env
        set +a
        return 0
    else
        print_error "Environment file .env not found"
        return 1
    fi
}

# Auto-detect server IP
detect_server_ip() {
    local ip
    
    # Try multiple methods to get local IP
    ip=$(hostname -I | cut -d' ' -f1 2>/dev/null) || \
    ip=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null) || \
    ip=$(ifconfig | grep -oP 'inet \K[0-9.]+' | grep -v 127.0.0.1 | head -1 2>/dev/null)
    
    if validate_ip "$ip"; then
        echo "$ip"
        return 0
    else
        print_error "Could not auto-detect server IP"
        return 1
    fi
}

# Generate secure random password
generate_password() {
    local length="${1:-12}"
    
    # Use multiple methods for password generation
    if command -v openssl &> /dev/null; then
        openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-$length
    elif [ -f /dev/urandom ]; then
        tr -dc 'A-Za-z0-9' < /dev/urandom | head -c $length
    else
        # Fallback method
        date +%s | sha256sum | base64 | head -c $length
    fi
}

# Generate secure secret key
generate_secret_key() {
    local length="${1:-64}"
    
    if command -v openssl &> /dev/null; then
        openssl rand -hex $((length / 2))
    else
        # Fallback method
        head -c $((length / 2)) /dev/urandom | od -An -tx1 | tr -d ' \n'
    fi
}

# Create environment file
create_env_file() {
    local server_ip="$1"
    local hostname="$2"
    local local_domain="$3"
    local timezone="$4"
    local pihole_password="$5"
    local searxng_secret_key="$6"
    local searxng_theme="$7"
    local searxng_safe_search="$8"
    local searxng_lang="$9"
    
    print_step "Creating environment configuration..."
    
    cat > .env << EOF
# Privacy Hub Environment Configuration
# Generated on $(date)

# Server configuration
SERVER_IP=$server_ip

# Timezone for logs and scheduling
TZ=$timezone

# Pi-hole admin password
PIHOLE_PASSWORD=$pihole_password

# SearXNG Configuration
SEARXNG_SECRET_KEY=$searxng_secret_key
SEARXNG_DEFAULT_THEME=$searxng_theme
SEARXNG_SAFE_SEARCH=$searxng_safe_search
SEARXNG_DEFAULT_LANG=$searxng_lang

# Hostname settings for local access
HOSTNAME=$hostname
LOCAL_DOMAIN=$local_domain

# Docker Compose project name
COMPOSE_PROJECT_NAME=privacy-hub
EOF

    if [ $? -eq 0 ]; then
        print_success "Environment file created successfully"
        return 0
    else
        print_error "Failed to create environment file"
        return 1
    fi
}

# Backup environment file
backup_env() {
    if [ -f ".env" ]; then
        local backup_file=".env.backup.$(date +%Y%m%d_%H%M%S)"
        cp .env "$backup_file"
        print_success "Environment backed up to $backup_file"
    fi
}

# Update environment variable
update_env_var() {
    local key="$1"
    local value="$2"
    
    if [ -f ".env" ]; then
        if grep -q "^$key=" .env; then
            # Update existing variable
            sed -i "s/^$key=.*/$key=$value/" .env
        else
            # Add new variable
            echo "$key=$value" >> .env
        fi
        print_success "Updated $key in environment"
    else
        print_error "Environment file not found"
        return 1
    fi
}

# Show environment summary
show_env_summary() {
    if ! load_env; then
        return 1
    fi
    
    print_header "Environment Configuration Summary"
    
    echo -e "${BLUE}🌐 Network Settings:${NC}"
    echo "   Server IP: ${GREEN}$SERVER_IP${NC}"
    echo "   Hostname: ${GREEN}$HOSTNAME.$LOCAL_DOMAIN${NC}"
    echo "   Timezone: ${GREEN}$TZ${NC}"
    echo ""
    
    echo -e "${BLUE}🔑 Security Settings:${NC}"
    echo "   Pi-hole Password: ${GREEN}$PIHOLE_PASSWORD${NC}"
    echo "   SearXNG Secret: ${GREEN}${SEARXNG_SECRET_KEY:0:16}...${NC}"
    echo ""
    
    echo -e "${BLUE}🔍 SearXNG Settings:${NC}"
    echo "   Theme: ${GREEN}$SEARXNG_DEFAULT_THEME${NC}"
    echo "   Safe Search: ${GREEN}$SEARXNG_SAFE_SEARCH${NC}"
    echo "   Language: ${GREEN}$SEARXNG_DEFAULT_LANG${NC}"
}

# Validate environment configuration
validate_env() {
    if ! load_env; then
        return 1
    fi
    
    local errors=0
    
    # Check required variables
    local required_vars=(
        "SERVER_IP"
        "HOSTNAME"
        "LOCAL_DOMAIN"
        "TZ"
        "PIHOLE_PASSWORD"
        "SEARXNG_SECRET_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Missing required environment variable: $var"
            ((errors++))
        fi
    done
    
    # Validate IP address
    if ! validate_ip "$SERVER_IP"; then
        print_error "Invalid server IP address: $SERVER_IP"
        ((errors++))
    fi
    
    # Validate hostname
    if ! validate_hostname "$HOSTNAME"; then
        print_error "Invalid hostname: $HOSTNAME"
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Environment configuration is valid"
        return 0
    else
        print_error "Environment validation failed ($errors errors)"
        return 1
    fi
}