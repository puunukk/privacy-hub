#!/bin/bash
# Input validation utilities

# Source colors for output
source "$(dirname "${BASH_SOURCE[0]}")/colors.sh" 2>/dev/null || {
    RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
    print_error() { echo -e "${RED}❌ $1${NC}"; }
    print_success() { echo -e "${GREEN}✅ $1${NC}"; }
}

# Validate required dependencies
check_dependencies() {
    local deps=("$@")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_error "Missing required dependencies: ${missing[*]}"
        echo "Please install them and try again."
        return 1
    fi
    
    return 0
}

# Validate Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running or not accessible"
        echo "Please start Docker and ensure your user is in the docker group"
        return 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available"
        echo "Please install Docker Compose"
        return 1
    fi
    
    return 0
}

# Validate network configuration
check_network() {
    local server_ip="$1"
    
    # Check if IP is reachable
    if ! ping -c 1 -W 1 "$server_ip" &> /dev/null; then
        print_error "Cannot reach IP address: $server_ip"
        return 1
    fi
    
    # Check if common ports are available
    local ports=(53 80 443)
    for port in "${ports[@]}"; do
        if ss -tuln | grep -q ":$port "; then
            print_error "Port $port is already in use"
            return 1
        fi
    done
    
    return 0
}

# Validate file exists and is readable
check_file() {
    local file="$1"
    local description="${2:-File}"
    
    if [ ! -f "$file" ]; then
        print_error "$description not found: $file"
        return 1
    fi
    
    if [ ! -r "$file" ]; then
        print_error "$description is not readable: $file"
        return 1
    fi
    
    return 0
}

# Validate directory exists and is writable
check_directory() {
    local dir="$1"
    local description="${2:-Directory}"
    
    if [ ! -d "$dir" ]; then
        print_error "$description not found: $dir"
        return 1
    fi
    
    if [ ! -w "$dir" ]; then
        print_error "$description is not writable: $dir"
        return 1
    fi
    
    return 0
}

# Validate port number
validate_port() {
    local port="$1"
    
    if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
        print_error "Invalid port number: $port"
        return 1
    fi
    
    return 0
}

# Check if port is available
check_port_available() {
    local port="$1"
    local protocol="${2:-tcp}"
    
    if ss -"${protocol}"ln | grep -q ":$port "; then
        print_error "Port $port/$protocol is already in use"
        return 1
    fi
    
    return 0
}

# Validate email format
validate_email() {
    local email="$1"
    local regex='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if [[ $email =~ $regex ]]; then
        return 0
    else
        print_error "Invalid email format: $email"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    local required_mb="${1:-1024}"  # Default 1GB
    local path="${2:-.}"
    
    local available_kb=$(df "$path" | awk 'NR==2 {print $4}')
    local available_mb=$((available_kb / 1024))
    
    if [ "$available_mb" -lt "$required_mb" ]; then
        print_error "Insufficient disk space. Required: ${required_mb}MB, Available: ${available_mb}MB"
        return 1
    fi
    
    return 0
}

# Check system memory
check_memory() {
    local required_mb="${1:-512}"  # Default 512MB
    
    local total_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
    local total_mb=$((total_kb / 1024))
    
    if [ "$total_mb" -lt "$required_mb" ]; then
        print_error "Insufficient memory. Required: ${required_mb}MB, Available: ${total_mb}MB"
        return 1
    fi
    
    return 0
}

# Validate system requirements
check_system_requirements() {
    local checks_passed=0
    local total_checks=5
    
    echo "Checking system requirements..."
    
    # Check base dependencies (Compose verified separately by check_docker)
    if check_dependencies docker openssl curl; then
        print_success "Dependencies available"
        ((checks_passed++))
    fi
    
    # Check Docker
    if check_docker; then
        print_success "Docker is running"
        ((checks_passed++))
    fi
    
    # Check disk space (2GB)
    if check_disk_space 2048; then
        print_success "Sufficient disk space"
        ((checks_passed++))
    fi
    
    # Check memory (1GB)
    if check_memory 1024; then
        print_success "Sufficient memory"
        ((checks_passed++))
    fi
    
    # Check we're not root (for security)
    if [ "$EUID" -ne 0 ]; then
        print_success "Running as non-root user"
        ((checks_passed++))
    else
        print_error "Please do not run as root user"
        ((checks_passed++))
    fi
    
    if [ "$checks_passed" -eq "$total_checks" ]; then
        print_success "All system requirements met"
        return 0
    else
        print_error "System requirements check failed ($checks_passed/$total_checks passed)"
        return 1
    fi
}