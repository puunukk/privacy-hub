#!/bin/bash
# SSL certificate management utilities

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/prompts.sh"
source "$SCRIPT_DIR/env.sh"

# Generate self-signed certificate
generate_self_signed_cert() {
    local cert_dir="${1:-nginx/ssl}"
    local hostname="${2:-localhost}"
    local ip="${3:-127.0.0.1}"
    
    print_step "Generating self-signed SSL certificate..."
    
    # Create SSL directory
    mkdir -p "$cert_dir"
    
    # Create certificate configuration
    cat > "$cert_dir/cert.conf" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=Local
L=Local
O=Privacy Hub
CN=$hostname

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = $hostname
DNS.2 = localhost
IP.1 = $ip
IP.2 = 127.0.0.1
EOF

    # Generate private key and certificate
    if openssl req -x509 -newkey rsa:2048 -keyout "$cert_dir/nginx.key" -out "$cert_dir/nginx.crt" \
        -days 365 -nodes -config "$cert_dir/cert.conf" &> /dev/null; then
        
        # Set proper permissions
        chmod 600 "$cert_dir/nginx.key"
        chmod 644 "$cert_dir/nginx.crt"
        
        # Remove temporary config
        rm "$cert_dir/cert.conf"
        
        print_success "Self-signed certificate generated successfully"
        return 0
    else
        print_error "Failed to generate self-signed certificate"
        return 1
    fi
}

# Generate mkcert certificate (trusted)
generate_mkcert_cert() {
    local cert_dir="${1:-nginx/ssl}"
    local hostname="${2:-localhost}"
    local ip="${3:-127.0.0.1}"
    
    print_step "Generating trusted certificate with mkcert..."
    
    # Check if mkcert is available
    if ! command -v mkcert &> /dev/null; then
        print_error "mkcert is not installed"
        echo "Install mkcert first: https://github.com/FiloSottile/mkcert"
        return 1
    fi
    
    # Create SSL directory
    mkdir -p "$cert_dir"
    
    # Generate certificate
    cd "$cert_dir"
    if mkcert "$hostname" "$ip" localhost 127.0.0.1 ::1; then
        
        # Rename files to expected names
        mv "${hostname}+4.pem" nginx.crt 2>/dev/null || \
        mv localhost+4.pem nginx.crt 2>/dev/null || {
            print_error "Could not find generated certificate file"
            return 1
        }
        
        mv "${hostname}+4-key.pem" nginx.key 2>/dev/null || \
        mv localhost+4-key.pem nginx.key 2>/dev/null || {
            print_error "Could not find generated key file"
            return 1
        }
        
        # Set proper permissions
        chmod 600 nginx.key
        chmod 644 nginx.crt
        
        cd - > /dev/null
        
        print_success "Trusted certificate generated successfully"
        return 0
    else
        cd - > /dev/null
        print_error "Failed to generate trusted certificate"
        return 1
    fi
}

# Check certificate status
check_certificate() {
    local cert_file="${1:-nginx/ssl/nginx.crt}"
    
    if [ ! -f "$cert_file" ]; then
        print_error "Certificate file not found: $cert_file"
        return 1
    fi
    
    print_step "Checking SSL certificate..."
    
    # Get certificate information
    local subject=$(openssl x509 -in "$cert_file" -noout -subject 2>/dev/null | sed 's/subject=//')
    local issuer=$(openssl x509 -in "$cert_file" -noout -issuer 2>/dev/null | sed 's/issuer=//')
    local dates=$(openssl x509 -in "$cert_file" -noout -dates 2>/dev/null)
    local not_before=$(echo "$dates" | grep notBefore | cut -d= -f2)
    local not_after=$(echo "$dates" | grep notAfter | cut -d= -f2)
    
    # Check if certificate is expired
    if openssl x509 -in "$cert_file" -noout -checkend 0 &> /dev/null; then
        print_success "Certificate is valid"
    else
        print_error "Certificate has expired"
    fi
    
    # Display certificate details
    echo ""
    echo -e "${BLUE}Certificate Details:${NC}"
    echo "  Subject: $subject"
    echo "  Issuer: $issuer"
    echo "  Valid from: $not_before"
    echo "  Valid until: $not_after"
    
    # Check if it's a self-signed certificate
    if [ "$subject" = "$issuer" ]; then
        print_info "This is a self-signed certificate"
    else
        print_success "This is a CA-signed certificate"
    fi
    
    return 0
}

# Install mkcert CA
install_mkcert_ca() {
    print_step "Installing mkcert CA..."
    
    if command -v mkcert &> /dev/null; then
        if mkcert -install; then
            print_success "mkcert CA installed successfully"
            print_info "Certificates generated with mkcert will now be trusted"
            return 0
        else
            print_error "Failed to install mkcert CA"
            return 1
        fi
    else
        print_error "mkcert is not installed"
        return 1
    fi
}

# Upgrade to trusted certificate
upgrade_to_trusted_cert() {
    if ! load_env; then
        return 1
    fi
    
    local hostname="${HOSTNAME}.${LOCAL_DOMAIN}"
    local ip="$SERVER_IP"
    
    print_header "SSL Certificate Upgrade"
    
    # Check if mkcert is available
    if ! command -v mkcert &> /dev/null; then
        print_info "Installing mkcert for trusted certificates..."
        
        # Provide installation instructions
        echo ""
        echo -e "${YELLOW}To generate trusted certificates, install mkcert:${NC}"
        echo ""
        echo "# On Ubuntu/Debian:"
        echo "sudo apt install libnss3-tools"
        echo "wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v*-linux-amd64"
        echo "chmod +x mkcert"
        echo "sudo mv mkcert /usr/local/bin/"
        echo ""
        echo "# Then run: mkcert -install"
        echo ""
        
        if confirm "Do you want to continue with self-signed certificate instead?"; then
            generate_self_signed_cert "nginx/ssl" "$hostname" "$ip"
        fi
        return $?
    fi
    
    # Install CA if not done
    if ! mkcert -CAROOT &> /dev/null; then
        print_info "Installing mkcert CA first..."
        install_mkcert_ca
    fi
    
    # Backup existing certificate
    if [ -f "nginx/ssl/nginx.crt" ]; then
        print_step "Backing up existing certificate..."
        cp nginx/ssl/nginx.crt "nginx/ssl/nginx.crt.backup.$(date +%Y%m%d_%H%M%S)"
        cp nginx/ssl/nginx.key "nginx/ssl/nginx.key.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Generate new trusted certificate
    if generate_mkcert_cert "nginx/ssl" "$hostname" "$ip"; then
        print_success "Certificate upgrade completed!"
        
        # Restart nginx to use new certificate
        if docker compose ps --services --filter "status=running" | grep -q nginx; then
            print_step "Restarting NGINX to use new certificate..."
            docker compose restart nginx
        fi
        
        echo ""
        print_info "New trusted certificate details:"
        check_certificate "nginx/ssl/nginx.crt"
        
        return 0
    else
        print_error "Certificate upgrade failed"
        return 1
    fi
}

# Renew certificate
renew_certificate() {
    if ! load_env; then
        return 1
    fi
    
    local hostname="${HOSTNAME}.${LOCAL_DOMAIN}"
    local ip="$SERVER_IP"
    
    print_step "Renewing SSL certificate..."
    
    # Choose certificate type
    local cert_type
    if command -v mkcert &> /dev/null; then
        if confirm "Generate trusted certificate with mkcert?" "y"; then
            cert_type="trusted"
        else
            cert_type="self-signed"
        fi
    else
        cert_type="self-signed"
    fi
    
    # Backup existing certificate
    if [ -f "nginx/ssl/nginx.crt" ]; then
        local backup_dir="nginx/ssl/backup/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        cp nginx/ssl/nginx.* "$backup_dir/"
        print_success "Existing certificate backed up to $backup_dir"
    fi
    
    # Generate new certificate
    if [ "$cert_type" = "trusted" ]; then
        generate_mkcert_cert "nginx/ssl" "$hostname" "$ip"
    else
        generate_self_signed_cert "nginx/ssl" "$hostname" "$ip"
    fi
    
    # Restart nginx
    if docker compose ps --services --filter "status=running" | grep -q nginx; then
        print_step "Restarting NGINX..."
        docker compose restart nginx
        print_success "NGINX restarted with new certificate"
    fi
}