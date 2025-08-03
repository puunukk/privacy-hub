#!/bin/bash
# Docker operations utilities

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../utils/colors.sh"
source "$SCRIPT_DIR/../utils/validation.sh"

# Check if services are running
check_services_status() {
    local services=("nginx" "pihole" "searxng")
    local running=0
    local total=${#services[@]}
    
    for service in "${services[@]}"; do
        if docker compose ps --services --filter "status=running" | grep -q "^$service$"; then
            print_success "$service is running"
            ((running++))
        else
            print_error "$service is not running"
        fi
    done
    
    if [ $running -eq $total ]; then
        print_success "All services are running ($running/$total)"
        return 0
    else
        print_warning "Some services are not running ($running/$total)"
        return 1
    fi
}

# Start all services
start_services() {
    print_step "Starting Privacy Hub services..."
    
    if docker compose up -d; then
        print_success "Services started successfully"
        
        # Wait for services to initialize
        print_step "Waiting for services to initialize..."
        sleep 10
        
        return 0
    else
        print_error "Failed to start services"
        return 1
    fi
}

# Stop all services
stop_services() {
    print_step "Stopping Privacy Hub services..."
    
    if docker compose down; then
        print_success "Services stopped successfully"
        return 0
    else
        print_error "Failed to stop services"
        return 1
    fi
}

# Restart all services
restart_services() {
    print_step "Restarting Privacy Hub services..."
    
    if docker compose restart; then
        print_success "Services restarted successfully"
        
        # Wait for services to initialize
        print_step "Waiting for services to initialize..."
        sleep 10
        
        return 0
    else
        print_error "Failed to restart services"
        return 1
    fi
}

# Rebuild and restart services
rebuild_services() {
    print_step "Rebuilding Privacy Hub services..."
    
    # Stop services first
    docker compose down
    
    # Rebuild and start
    if docker compose up --build -d; then
        print_success "Services rebuilt successfully"
        
        # Wait for services to initialize
        print_step "Waiting for services to initialize..."
        sleep 15
        
        return 0
    else
        print_error "Failed to rebuild services"
        return 1
    fi
}

# Show service logs
show_logs() {
    local service="$1"
    local lines="${2:-50}"
    
    if [ -n "$service" ]; then
        print_info "Showing logs for $service (last $lines lines)..."
        docker compose logs --tail="$lines" "$service"
    else
        print_info "Showing logs for all services (last $lines lines)..."
        docker compose logs --tail="$lines"
    fi
}

# Follow service logs
follow_logs() {
    local service="$1"
    
    if [ -n "$service" ]; then
        print_info "Following logs for $service (Ctrl+C to stop)..."
        docker compose logs -f "$service"
    else
        print_info "Following logs for all services (Ctrl+C to stop)..."
        docker compose logs -f
    fi
}

# Execute command in container
exec_in_container() {
    local container="$1"
    shift
    local command=("$@")
    
    if docker compose ps --services --filter "status=running" | grep -q "^$container$"; then
        docker exec "$container" "${command[@]}"
    else
        print_error "Container $container is not running"
        return 1
    fi
}

# Get container IP address
get_container_ip() {
    local container="$1"
    
    if docker compose ps --services --filter "status=running" | grep -q "^$container$"; then
        docker inspect "$container" --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
    else
        print_error "Container $container is not running"
        return 1
    fi
}

# Check container health
check_container_health() {
    local container="$1"
    
    if docker compose ps --services --filter "status=running" | grep -q "^$container$"; then
        local health=$(docker inspect "$container" --format='{{.State.Health.Status}}' 2>/dev/null)
        
        case "$health" in
            "healthy")
                print_success "$container is healthy"
                return 0
                ;;
            "unhealthy")
                print_error "$container is unhealthy"
                return 1
                ;;
            "")
                print_info "$container has no health check configured"
                return 0
                ;;
            *)
                print_warning "$container health status: $health"
                return 1
                ;;
        esac
    else
        print_error "Container $container is not running"
        return 1
    fi
}

# Show container resource usage
show_resource_usage() {
    print_header "Container Resource Usage"
    
    if command -v docker &> /dev/null; then
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    else
        print_error "Docker not available"
        return 1
    fi
}

# Clean up unused Docker resources
cleanup_docker() {
    print_step "Cleaning up unused Docker resources..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused networks
    docker network prune -f
    
    # Remove unused volumes (be careful with this)
    if confirm "Remove unused Docker volumes? This may delete data!"; then
        docker volume prune -f
    fi
    
    print_success "Docker cleanup completed"
}

# Backup container data
backup_container_data() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    
    print_step "Creating backup in $backup_dir..."
    
    mkdir -p "$backup_dir"
    
    # Backup Pi-hole data
    if [ -d "pihole/data" ]; then
        cp -r pihole/data "$backup_dir/pihole-data"
        print_success "Pi-hole data backed up"
    fi
    
    # Backup SearXNG data
    if [ -d "searxng/data" ]; then
        cp -r searxng/data "$backup_dir/searxng-data"
        print_success "SearXNG data backed up"
    fi
    
    # Backup environment file
    if [ -f ".env" ]; then
        cp .env "$backup_dir/env"
        print_success "Environment configuration backed up"
    fi
    
    # Backup SSL certificates
    if [ -d "nginx/ssl" ]; then
        cp -r nginx/ssl "$backup_dir/ssl"
        print_success "SSL certificates backed up"
    fi
    
    print_success "Backup completed: $backup_dir"
}