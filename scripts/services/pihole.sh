#!/bin/bash
# Pi-hole specific operations

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/prompts.sh"
source "$SCRIPT_DIR/../core/env.sh"
source "$SCRIPT_DIR/../core/docker.sh"

# Set Pi-hole admin password
set_pihole_password() {
    local password="$1"
    
    if [ -z "$password" ]; then
        if ! load_env; then
            return 1
        fi
        password="$PIHOLE_PASSWORD"
    fi
    
    print_step "Setting Pi-hole admin password..."
    
    if exec_in_container pihole pihole setpassword "$password"; then
        print_success "Pi-hole password set successfully"
        return 0
    else
        print_error "Failed to set Pi-hole password"
        return 1
    fi
}

# Reset Pi-hole password interactively
reset_pihole_password() {
    if ! load_env; then
        return 1
    fi
    
    print_header "Pi-hole Password Management"
    
    echo ""
    echo -e "${BLUE}Current password: ${GREEN}$PIHOLE_PASSWORD${NC}"
    echo ""
    
    if confirm "Do you want to generate a new random password?" "n"; then
        # Generate new password
        local new_password
        new_password=$(generate_password 12)
        
        echo ""
        echo -e "${GREEN}New password: $new_password${NC}"
        echo ""
        
        if confirm "Use this password?"; then
            # Update environment file
            update_env_var "PIHOLE_PASSWORD" "$new_password"
            
            # Set password in container
            set_pihole_password "$new_password"
            
            print_success "Password updated successfully!"
            echo "New password: $new_password"
        fi
    else
        # Manual password entry
        local manual_password
        prompt_password "Enter new password" manual_password
        
        # Update environment file
        update_env_var "PIHOLE_PASSWORD" "$manual_password"
        
        # Set password in container
        set_pihole_password "$manual_password"
        
        print_success "Password updated successfully!"
    fi
}

# Update Pi-hole blocklists
update_blocklists() {
    print_step "Updating Pi-hole blocklists..."
    
    if exec_in_container pihole pihole -g; then
        print_success "Blocklists updated successfully"
        return 0
    else
        print_error "Failed to update blocklists"
        return 1
    fi
}

# Add domain to blocklist
block_domain() {
    local domain="$1"
    
    if [ -z "$domain" ]; then
        echo -n -e "${BLUE}❓ Enter domain to block: ${NC}"
        read -r domain
    fi
    
    if [ -n "$domain" ]; then
        print_step "Blocking domain: $domain"
        
        if exec_in_container pihole pihole -b "$domain"; then
            print_success "Domain $domain blocked successfully"
            return 0
        else
            print_error "Failed to block domain $domain"
            return 1
        fi
    else
        print_error "No domain provided"
        return 1
    fi
}

# Remove domain from blocklist
unblock_domain() {
    local domain="$1"
    
    if [ -z "$domain" ]; then
        echo -n -e "${BLUE}❓ Enter domain to unblock: ${NC}"
        read -r domain
    fi
    
    if [ -n "$domain" ]; then
        print_step "Unblocking domain: $domain"
        
        if exec_in_container pihole pihole -w "$domain"; then
            print_success "Domain $domain unblocked successfully"
            return 0
        else
            print_error "Failed to unblock domain $domain"
            return 1
        fi
    else
        print_error "No domain provided"
        return 1
    fi
}

# Query domain in Pi-hole
query_domain() {
    local domain="$1"
    
    if [ -z "$domain" ]; then
        echo -n -e "${BLUE}❓ Enter domain to query: ${NC}"
        read -r domain
    fi
    
    if [ -n "$domain" ]; then
        print_step "Querying domain: $domain"
        
        exec_in_container pihole pihole -q "$domain"
    else
        print_error "No domain provided"
        return 1
    fi
}

# Show Pi-hole status
show_pihole_status() {
    print_header "Pi-hole Status"
    
    # Check if container is running
    if ! docker compose ps --services --filter "status=running" | grep -q pihole; then
        print_error "Pi-hole container is not running"
        return 1
    fi
    
    # Get Pi-hole status
    echo ""
    print_step "Getting Pi-hole status..."
    exec_in_container pihole pihole status
    
    echo ""
    print_step "Getting Pi-hole version..."
    exec_in_container pihole pihole version
    
    # Test API connectivity
    echo ""
    print_step "Testing Pi-hole API..."
    if load_env; then
        if curl -k -s --max-time 5 "https://$SERVER_IP/api/version" | grep -q "version"; then
            print_success "Pi-hole API is responding"
        else
            print_error "Pi-hole API is not responding"
        fi
    fi
}

# Show Pi-hole logs
show_pihole_logs() {
    local lines="${1:-50}"
    
    print_info "Showing Pi-hole logs (last $lines lines)..."
    
    if docker compose ps --services --filter "status=running" | grep -q pihole; then
        exec_in_container pihole tail -n "$lines" /var/log/pihole.log
    else
        print_error "Pi-hole container is not running"
        return 1
    fi
}

# Flush Pi-hole logs
flush_pihole_logs() {
    print_step "Flushing Pi-hole logs..."
    
    if exec_in_container pihole pihole -f; then
        print_success "Pi-hole logs flushed successfully"
        return 0
    else
        print_error "Failed to flush Pi-hole logs"
        return 1
    fi
}

# Enable/disable Pi-hole
toggle_pihole() {
    local action="$1"  # enable or disable
    local duration="$2"  # optional duration for disable
    
    if [ -z "$action" ]; then
        if confirm "Do you want to disable Pi-hole?" "n"; then
            action="disable"
            
            echo ""
            echo "Disable duration options:"
            echo "1) 10 seconds"
            echo "2) 30 seconds" 
            echo "3) 5 minutes"
            echo "4) Permanently (until manually enabled)"
            echo ""
            
            echo -n -e "${BLUE}❓ Select duration [1-4]: ${NC}"
            read -r choice
            
            case "$choice" in
                1) duration="10s" ;;
                2) duration="30s" ;;
                3) duration="5m" ;;
                4) duration="" ;;
                *) duration="30s" ;;
            esac
        else
            action="enable"
        fi
    fi
    
    case "$action" in
        "enable")
            print_step "Enabling Pi-hole..."
            if exec_in_container pihole pihole enable; then
                print_success "Pi-hole enabled successfully"
            else
                print_error "Failed to enable Pi-hole"
                return 1
            fi
            ;;
        "disable")
            if [ -n "$duration" ]; then
                print_step "Disabling Pi-hole for $duration..."
                if exec_in_container pihole pihole disable "$duration"; then
                    print_success "Pi-hole disabled for $duration"
                else
                    print_error "Failed to disable Pi-hole"
                    return 1
                fi
            else
                print_step "Disabling Pi-hole permanently..."
                if exec_in_container pihole pihole disable; then
                    print_warning "Pi-hole disabled permanently"
                    print_info "Remember to enable it later with: pihole enable"
                else
                    print_error "Failed to disable Pi-hole"
                    return 1
                fi
            fi
            ;;
        *)
            print_error "Invalid action: $action"
            return 1
            ;;
    esac
}

# Restart Pi-hole DNS service
restart_pihole_dns() {
    print_step "Restarting Pi-hole DNS service..."
    
    if exec_in_container pihole pihole restartdns; then
        print_success "Pi-hole DNS service restarted successfully"
        return 0
    else
        print_error "Failed to restart Pi-hole DNS service"
        return 1
    fi
}