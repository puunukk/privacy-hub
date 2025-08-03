#!/bin/bash
# Network testing and connectivity utilities

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/env.sh"

# Test external connectivity
test_external_connectivity() {
    print_step "Testing external connectivity..."
    
    local test_hosts=("1.1.1.1" "8.8.8.8" "google.com")
    local passed=0
    
    for host in "${test_hosts[@]}"; do
        if ping -c 1 -W 3 "$host" &> /dev/null; then
            print_success "Can reach $host"
            ((passed++))
        else
            print_error "Cannot reach $host"
        fi
    done
    
    if [ $passed -gt 0 ]; then
        print_success "External connectivity test passed ($passed/3)"
        return 0
    else
        print_error "No external connectivity"
        return 1
    fi
}

# Test internal container connectivity
test_internal_connectivity() {
    print_step "Testing internal container connectivity..."
    
    local containers=("pihole" "searxng")
    local passed=0
    
    for container in "${containers[@]}"; do
        if docker exec nginx ping -c 1 -W 3 "$container" &> /dev/null; then
            print_success "NGINX can reach $container"
            ((passed++))
        else
            print_error "NGINX cannot reach $container"
        fi
    done
    
    if [ $passed -eq ${#containers[@]} ]; then
        print_success "Internal connectivity test passed"
        return 0
    else
        print_error "Internal connectivity issues detected"
        return 1
    fi
}

# Test DNS resolution
test_dns_resolution() {
    local dns_server="$1"
    print_step "Testing DNS resolution via $dns_server..."
    
    local test_domains=("google.com" "github.com" "cloudflare.com")
    local passed=0
    
    for domain in "${test_domains[@]}"; do
        if nslookup "$domain" "$dns_server" &> /dev/null; then
            print_success "DNS resolution for $domain works"
            ((passed++))
        else
            print_error "DNS resolution for $domain failed"
        fi
    done
    
    if [ $passed -gt 0 ]; then
        print_success "DNS resolution test passed ($passed/3)"
        return 0
    else
        print_error "DNS resolution completely failed"
        return 1
    fi
}

# Test web interface accessibility
test_web_interfaces() {
    if ! load_env; then
        return 1
    fi
    
    print_step "Testing web interface accessibility..."
    
    local endpoints=(
        "https://$SERVER_IP/health:Health Check"
        "https://$SERVER_IP/:SearXNG Search"
        "https://$SERVER_IP/admin:Pi-hole Admin"
    )
    
    local passed=0
    
    for endpoint_info in "${endpoints[@]}"; do
        local url="${endpoint_info%:*}"
        local name="${endpoint_info#*:}"
        
        if curl -k -s --max-time 10 "$url" > /dev/null; then
            print_success "$name is accessible"
            ((passed++))
        else
            print_error "$name is not accessible"
        fi
    done
    
    if [ $passed -eq ${#endpoints[@]} ]; then
        print_success "All web interfaces are accessible"
        return 0
    else
        print_error "Some web interfaces are not accessible ($passed/${#endpoints[@]})"
        return 1
    fi
}

# Test specific service endpoints
test_service_endpoints() {
    if ! load_env; then
        return 1
    fi
    
    print_step "Testing service-specific endpoints..."
    
    # Test Pi-hole API
    if curl -k -s --max-time 5 "https://$SERVER_IP/api/version" | grep -q "version"; then
        print_success "Pi-hole API is responding"
    else
        print_error "Pi-hole API is not responding"
    fi
    
    # Test SearXNG
    if curl -k -s --max-time 5 "https://$SERVER_IP/" | grep -q -i "search"; then
        print_success "SearXNG is responding"
    else
        print_error "SearXNG is not responding"
    fi
}

# Check port availability
check_ports() {
    print_step "Checking port availability..."
    
    local ports=("53" "80" "443")
    local available=0
    
    for port in "${ports[@]}"; do
        if ! ss -tuln | grep -q ":$port "; then
            print_success "Port $port is available"
            ((available++))
        else
            print_warning "Port $port is in use"
            
            # Show what's using the port
            local process=$(ss -tulnp | grep ":$port " | awk '{print $7}' | head -1)
            if [ -n "$process" ]; then
                echo "  Used by: $process"
            fi
        fi
    done
    
    if [ $available -eq ${#ports[@]} ]; then
        print_success "All required ports are available"
        return 0
    else
        print_warning "Some ports are in use (this may be normal if services are running)"
        return 1
    fi
}

# Network diagnostics
run_network_diagnostics() {
    print_header "Network Diagnostics"
    
    # Load environment
    if ! load_env; then
        return 1
    fi
    
    local tests_passed=0
    local total_tests=5
    
    # Test external connectivity
    if test_external_connectivity; then
        ((tests_passed++))
    fi
    
    # Test DNS resolution
    if test_dns_resolution "$SERVER_IP"; then
        ((tests_passed++))
    fi
    
    # Test internal connectivity (if containers are running)
    if docker compose ps --services --filter "status=running" | grep -q nginx; then
        if test_internal_connectivity; then
            ((tests_passed++))
        fi
    else
        print_info "Skipping internal connectivity test (containers not running)"
        ((tests_passed++))  # Don't penalize for not running
    fi
    
    # Test web interfaces (if services are running)
    if docker compose ps --services --filter "status=running" | grep -q nginx; then
        if test_web_interfaces; then
            ((tests_passed++))
        fi
        
        if test_service_endpoints; then
            ((tests_passed++))
        fi
    else
        print_info "Skipping web interface tests (services not running)"
        tests_passed=$((tests_passed + 2))  # Don't penalize for not running
    fi
    
    echo ""
    if [ $tests_passed -eq $total_tests ]; then
        print_success "All network diagnostics passed ($tests_passed/$total_tests)"
        return 0
    else
        print_warning "Network diagnostics completed ($tests_passed/$total_tests passed)"
        return 1
    fi
}

# Fix common network issues
fix_network_issues() {
    print_step "Attempting to fix common network issues..."
    
    # Restart networking in containers
    if docker compose ps --services --filter "status=running" | grep -q nginx; then
        print_info "Restarting nginx container..."
        docker compose restart nginx
        sleep 5
    fi
    
    # Flush DNS cache on host
    if command -v systemd-resolve &> /dev/null; then
        print_info "Flushing system DNS cache..."
        sudo systemd-resolve --flush-caches 2>/dev/null || true
    fi
    
    # Test connectivity after fixes
    sleep 5
    if test_external_connectivity && test_web_interfaces; then
        print_success "Network issues appear to be resolved"
        return 0
    else
        print_warning "Some network issues may still persist"
        return 1
    fi
}