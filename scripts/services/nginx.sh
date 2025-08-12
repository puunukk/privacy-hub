#!/bin/bash
# NGINX specific operations

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../core/env.sh"
source "$SCRIPT_DIR/../core/docker.sh"

# Test NGINX configuration
test_nginx_config() {
    print_step "Testing NGINX configuration..."
    
    if exec_in_container nginx nginx -t; then
        print_success "NGINX configuration is valid"
        return 0
    else
        print_error "NGINX configuration has errors"
        return 1
    fi
}

# Reload NGINX configuration
reload_nginx_config() {
    print_step "Reloading NGINX configuration..."
    
    # Test configuration first
    if ! test_nginx_config; then
        print_error "Cannot reload - configuration has errors"
        return 1
    fi
    
    if exec_in_container nginx nginx -s reload; then
        print_success "NGINX configuration reloaded successfully"
        return 0
    else
        print_error "Failed to reload NGINX configuration"
        return 1
    fi
}

# Show NGINX status
show_nginx_status() {
    print_header "NGINX Status"
    
    # Check if container is running
    if ! docker compose ps --services --filter "status=running" | grep -q nginx; then
        print_error "NGINX container is not running"
        return 1
    fi
    
    print_success "NGINX container is running"
    
    # Test configuration
    echo ""
    if test_nginx_config; then
        print_success "NGINX configuration is valid"
    else
        print_error "NGINX configuration has errors"
    fi
    
    # Test web interfaces
    echo ""
    print_step "Testing web interface accessibility..."
    if load_env; then
        local endpoints=(
            "https://$SERVER_IP/health:Health Check"
            "https://$SERVER_IP/:SearXNG"
            "https://$SERVER_IP/admin:Pi-hole Admin"
        )
        
        for endpoint_info in "${endpoints[@]}"; do
            local url="${endpoint_info%:*}"
            local name="${endpoint_info#*:}"
            
            if curl -k -s --max-time 5 "$url" > /dev/null; then
                print_success "$name is accessible"
            else
                print_error "$name is not accessible"
            fi
        done
    fi
}

# Show NGINX logs
show_nginx_logs() {
    local lines="${1:-50}"
    local log_type="${2:-access}"  # access or error
    
    print_info "Showing NGINX $log_type logs (last $lines lines)..."
    
    if docker compose ps --services --filter "status=running" | grep -q nginx; then
        case "$log_type" in
            "access")
                exec_in_container nginx tail -n "$lines" /var/log/nginx/access.log 2>/dev/null || \
                print_info "Access logs not available (logging may be disabled)"
                ;;
            "error")
                exec_in_container nginx tail -n "$lines" /var/log/nginx/error.log 2>/dev/null || \
                print_info "Error logs not available"
                ;;
            *)
                print_error "Invalid log type: $log_type"
                return 1
                ;;
        esac
    else
        print_error "NGINX container is not running"
        return 1
    fi
}

# Show NGINX version and modules
show_nginx_info() {
    print_header "NGINX Information"
    
    if ! docker compose ps --services --filter "status=running" | grep -q nginx; then
        print_error "NGINX container is not running"
        return 1
    fi
    
    echo ""
    print_step "NGINX version:"
    exec_in_container nginx nginx -v
    
    echo ""
    print_step "Compiled modules:"
    exec_in_container nginx nginx -V 2>&1 | grep -o 'with-[^[:space:]]*' | sort
    
    echo ""
    print_step "Configuration test:"
    test_nginx_config
}

# Show NGINX connection statistics
show_nginx_connections() {
    print_header "NGINX Connection Statistics"
    
    if ! docker compose ps --services --filter "status=running" | grep -q nginx; then
        print_error "NGINX container is not running"
        return 1
    fi
    
    # Try to get stub_status if available
    if exec_in_container nginx curl -s http://localhost/nginx_status 2>/dev/null; then
        print_success "NGINX status module is available"
    else
        print_info "NGINX status module not configured"
    fi
    
    # Show process information
    echo ""
    print_step "NGINX processes:"
    exec_in_container nginx ps aux | grep nginx
}

# Test SSL certificate
test_nginx_ssl() {
    if ! load_env; then
        return 1
    fi
    
    print_step "Testing SSL certificate..."
    
    # Test SSL connection
    if echo | openssl s_client -connect "$SERVER_IP:443" -servername "$HOSTNAME.$LOCAL_DOMAIN" 2>/dev/null | grep -q "Verify return code: 0"; then
        print_success "SSL certificate is trusted"
    else
        print_warning "SSL certificate is self-signed or has issues"
    fi
    
    # Show certificate details
    echo ""
    print_step "Certificate details:"
    echo | openssl s_client -connect "$SERVER_IP:443" -servername "$HOSTNAME.$LOCAL_DOMAIN" 2>/dev/null | \
    openssl x509 -noout -subject -issuer -dates 2>/dev/null || \
    print_error "Could not retrieve certificate details"
}

# Restart NGINX service
restart_nginx() {
    print_step "Restarting NGINX service..."
    
    # Test configuration first
    if ! test_nginx_config; then
        print_error "Cannot restart - configuration has errors"
        return 1
    fi
    
    if docker compose restart nginx; then
        print_success "NGINX service restarted successfully"
        
        # Wait for service to be ready
        print_step "Waiting for NGINX to be ready..."
        sleep 5
        
        # Test if it's accessible
        if load_env && curl -k -s --max-time 5 "https://$SERVER_IP/health" > /dev/null; then
            print_success "NGINX is ready and accessible"
        else
            print_warning "NGINX restarted but may not be fully ready yet"
        fi
        
        return 0
    else
        print_error "Failed to restart NGINX service"
        return 1
    fi
}