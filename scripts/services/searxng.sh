#!/bin/bash
# SearXNG specific operations

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/prompts.sh"
source "$SCRIPT_DIR/../core/env.sh"
source "$SCRIPT_DIR/../core/docker.sh"

# Show SearXNG status
show_searxng_status() {
    print_header "SearXNG Status"
    
    # Check if container is running
    if ! docker compose ps --services --filter "status=running" | grep -q searxng; then
        print_error "SearXNG container is not running"
        return 1
    fi
    
    print_success "SearXNG container is running"
    
    # Test SearXNG accessibility
    echo ""
    print_step "Testing SearXNG accessibility..."
    if load_env; then
        if curl -k -s --max-time 10 "https://$SERVER_IP/" | grep -q -i "search"; then
            print_success "SearXNG web interface is accessible"
        else
            print_error "SearXNG web interface is not accessible"
        fi
    fi
    
    # Show current configuration
    echo ""
    print_step "Current SearXNG configuration:"
    if load_env; then
        echo "  Theme: ${GREEN}$SEARXNG_DEFAULT_THEME${NC}"
        echo "  Safe Search: ${GREEN}$SEARXNG_SAFE_SEARCH${NC}"
        echo "  Language: ${GREEN}$SEARXNG_DEFAULT_LANG${NC}"
    fi
}

# Show SearXNG logs
show_searxng_logs() {
    local lines="${1:-50}"
    
    print_info "Showing SearXNG logs (last $lines lines)..."
    show_logs searxng "$lines"
}

# Update SearXNG configuration
update_searxng_config() {
    if ! load_env; then
        return 1
    fi
    
    print_header "SearXNG Configuration Update"
    
    echo ""
    echo -e "${BLUE}Current configuration:${NC}"
    echo "  Theme: ${GREEN}$SEARXNG_DEFAULT_THEME${NC}"
    echo "  Safe Search: ${GREEN}$SEARXNG_SAFE_SEARCH${NC}"
    echo "  Language: ${GREEN}$SEARXNG_DEFAULT_LANG${NC}"
    echo ""
    
    local changed=false
    
    # Theme selection
    if confirm "Do you want to change the theme?"; then
        echo ""
        echo "Available themes:"
        echo "1) simple (clean, dark theme)"
        echo "2) oscar (feature-rich theme)"
        echo "3) pix-art (image-focused theme)"
        echo ""
        
        echo -n -e "${BLUE}❓ Select theme [1-3]: ${NC}"
        read -r choice
        
        case "$choice" in
            1) new_theme="simple" ;;
            2) new_theme="oscar" ;;
            3) new_theme="pix-art" ;;
            *) new_theme="$SEARXNG_DEFAULT_THEME" ;;
        esac
        
        if [ "$new_theme" != "$SEARXNG_DEFAULT_THEME" ]; then
            update_env_var "SEARXNG_DEFAULT_THEME" "$new_theme"
            changed=true
        fi
    fi
    
    # Safe search setting
    if confirm "Do you want to change safe search setting?"; then
        echo ""
        echo "Safe search options:"
        echo "0) Off (no filtering)"
        echo "1) Moderate filtering"
        echo "2) Strict filtering"
        echo ""
        
        echo -n -e "${BLUE}❓ Select safe search level [0-2]: ${NC}"
        read -r choice
        
        case "$choice" in
            0|1|2) new_safe_search="$choice" ;;
            *) new_safe_search="$SEARXNG_SAFE_SEARCH" ;;
        esac
        
        if [ "$new_safe_search" != "$SEARXNG_SAFE_SEARCH" ]; then
            update_env_var "SEARXNG_SAFE_SEARCH" "$new_safe_search"
            changed=true
        fi
    fi
    
    # Language setting
    if confirm "Do you want to change the default language?"; then
        echo ""
        echo "Common languages:"
        echo "en) English"
        echo "et) Estonian"
        echo "de) German"
        echo "fr) French"
        echo "es) Spanish"
        echo ""
        
        echo -n -e "${BLUE}❓ Enter language code: ${NC}"
        read -r new_lang
        
        if [ -n "$new_lang" ] && [ "$new_lang" != "$SEARXNG_DEFAULT_LANG" ]; then
            update_env_var "SEARXNG_DEFAULT_LANG" "$new_lang"
            changed=true
        fi
    fi
    
    if [ "$changed" = true ]; then
        print_step "Restarting SearXNG to apply changes..."
        docker compose restart searxng
        
        # Wait for restart
        sleep 10
        
        print_success "SearXNG configuration updated successfully"
        
        # Show new configuration
        load_env
        echo ""
        echo -e "${BLUE}New configuration:${NC}"
        echo "  Theme: ${GREEN}$SEARXNG_DEFAULT_THEME${NC}"
        echo "  Safe Search: ${GREEN}$SEARXNG_SAFE_SEARCH${NC}"
        echo "  Language: ${GREEN}$SEARXNG_DEFAULT_LANG${NC}"
    else
        print_info "No changes made to SearXNG configuration"
    fi
}

# Test SearXNG search functionality
test_searxng_search() {
    if ! load_env; then
        return 1
    fi
    
    print_step "Testing SearXNG search functionality..."
    
    # Test search with a simple query
    local test_query="privacy hub test"
    local search_url="https://$SERVER_IP/search?q=${test_query// /+}"
    
    if curl -k -s --max-time 15 "$search_url" | grep -q "results"; then
        print_success "SearXNG search is working"
        return 0
    else
        print_error "SearXNG search is not working properly"
        return 1
    fi
}

# Show SearXNG statistics (if available)
show_searxng_stats() {
    print_header "SearXNG Statistics"
    
    if ! docker compose ps --services --filter "status=running" | grep -q searxng; then
        print_error "SearXNG container is not running"
        return 1
    fi
    
    # SearXNG doesn't have built-in statistics like Pi-hole
    # But we can show container stats and basic info
    
    print_step "Container resource usage:"
    docker stats searxng --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    
    echo ""
    print_step "Container uptime:"
    docker inspect searxng --format='{{.State.StartedAt}}' | while read started; do
        if command -v date &> /dev/null; then
            start_timestamp=$(date -d "$started" +%s 2>/dev/null || echo "unknown")
            current_timestamp=$(date +%s)
            uptime_seconds=$((current_timestamp - start_timestamp))
            uptime_hours=$((uptime_seconds / 3600))
            uptime_minutes=$(((uptime_seconds % 3600) / 60))
            
            if [ "$uptime_hours" -gt 0 ]; then
                echo "  Uptime: ${uptime_hours}h ${uptime_minutes}m"
            else
                echo "  Uptime: ${uptime_minutes}m"
            fi
        else
            echo "  Started: $started"
        fi
    done
    
    # Test basic functionality
    echo ""
    if test_searxng_search; then
        print_success "Search functionality is working"
    else
        print_warning "Search functionality test failed"
    fi
}

# Restart SearXNG service
restart_searxng() {
    print_step "Restarting SearXNG service..."
    
    if docker compose restart searxng; then
        print_success "SearXNG service restarted successfully"
        
        # Wait for service to be ready
        print_step "Waiting for SearXNG to be ready..."
        sleep 10
        
        # Test if it's accessible
        if test_searxng_search; then
            print_success "SearXNG is ready and functional"
        else
            print_warning "SearXNG restarted but may not be fully ready yet"
        fi
        
        return 0
    else
        print_error "Failed to restart SearXNG service"
        return 1
    fi
}