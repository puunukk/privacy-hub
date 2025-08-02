#!/bin/bash
# Management script for Privacy Hub

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to show status
show_status() {
    echo -e "${GREEN}Privacy Hub Status:${NC}"
    docker-compose ps
    echo ""
    
    # Show local IP
    LOCAL_IP=$(hostname -I | cut -d' ' -f1)
    echo -e "${GREEN}Access URLs:${NC}"
    echo "🔍 Search: https://$LOCAL_IP"
    echo "🛡️ Pi-hole: https://$LOCAL_IP/admin"
    echo "❤️ Health: https://$LOCAL_IP/health"
}

# Function to restart services
restart_service() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}Restarting all services...${NC}"
        docker-compose restart
    else
        echo -e "${YELLOW}Restarting $1...${NC}"
        docker-compose restart $1
    fi
}

# Function to view logs
view_logs() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}Showing all logs...${NC}"
        docker-compose logs -f
    else
        echo -e "${YELLOW}Showing logs for $1...${NC}"
        docker-compose logs -f $1
    fi
}

# Function to update containers
update_containers() {
    echo -e "${YELLOW}Updating containers...${NC}"
    docker-compose pull
    docker-compose up -d --build
    echo -e "${GREEN}Update complete!${NC}"
}

# Function to backup configuration
backup_config() {
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    echo -e "${YELLOW}Creating backup in $BACKUP_DIR...${NC}"
    cp -r pihole/data "$BACKUP_DIR/pihole_data"
    cp -r searxng/data "$BACKUP_DIR/searxng_data"
    cp .env "$BACKUP_DIR/.env" 2>/dev/null || true
    
    echo -e "${GREEN}Backup created successfully!${NC}"
}

# Main script logic
case "$1" in
    "status"|"")
        show_status
        ;;
    "restart")
        restart_service $2
        ;;
    "logs")
        view_logs $2
        ;;
    "update")
        update_containers
        ;;
    "backup")
        backup_config
        ;;
    "stop")
        echo -e "${YELLOW}Stopping all services...${NC}"
        docker-compose down
        ;;
    "start")
        echo -e "${YELLOW}Starting all services...${NC}"
        docker-compose up -d
        ;;
    *)
        echo -e "${RED}Usage: $0 {status|restart [service]|logs [service]|update|backup|start|stop}${NC}"
        echo ""
        echo "Examples:"
        echo "  $0 status          # Show service status"
        echo "  $0 restart         # Restart all services"
        echo "  $0 restart nginx   # Restart only nginx"
        echo "  $0 logs pihole     # View pihole logs"
        echo "  $0 update          # Update all containers"
        echo "  $0 backup          # Create configuration backup"
        exit 1
        ;;
esac 