#!/bin/bash
# Color and formatting utilities

# Color definitions
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export PURPLE='\033[0;35m'
export CYAN='\033[0;36m'
export WHITE='\033[1;37m'
export NC='\033[0m' # No Color

# Text formatting
export BOLD='\033[1m'
export DIM='\033[2m'
export UNDERLINE='\033[4m'

# Emoji definitions for consistency
export EMOJI_SUCCESS="✅"
export EMOJI_ERROR="❌"
export EMOJI_WARNING="⚠️"
export EMOJI_INFO="ℹ️"
export EMOJI_QUESTION="❓"
export EMOJI_GEAR="⚙️"
export EMOJI_ROCKET="🚀"
export EMOJI_SHIELD="🛡️"
export EMOJI_SEARCH="🔍"
export EMOJI_HEALTH="❤️"
export EMOJI_LOCK="🔒"
export EMOJI_NETWORK="🌐"
export EMOJI_FIRE="🔥"

# Output functions
print_header() {
    echo -e "\n${BLUE}${BOLD}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 ${#1}))${NC}\n"
}

print_success() {
    echo -e "${GREEN}${EMOJI_SUCCESS} $1${NC}"
}

print_error() {
    echo -e "${RED}${EMOJI_ERROR} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${EMOJI_WARNING} $1${NC}"
}

print_info() {
    echo -e "${BLUE}${EMOJI_INFO} $1${NC}"
}

print_question() {
    echo -e "${PURPLE}${EMOJI_QUESTION} $1${NC}"
}

print_step() {
    echo -e "\n${CYAN}${EMOJI_GEAR} $1${NC}"
}

print_result() {
    local status=$1
    local message=$2
    
    if [ "$status" = "success" ]; then
        print_success "$message"
    elif [ "$status" = "error" ]; then
        print_error "$message"
    elif [ "$status" = "warning" ]; then
        print_warning "$message"
    else
        print_info "$message"
    fi
}

# Progress indicators
show_spinner() {
    local pid=$1
    local message=$2
    local spinner='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    echo -n -e "${BLUE}${message}${NC} "
    while [ -d /proc/$pid ]; do
        printf "\r${BLUE}${message}${NC} ${spinner:$i:1}"
        i=$(( (i+1) %10 ))
        sleep 0.1
    done
    printf "\r${BLUE}${message}${NC} ${GREEN}${EMOJI_SUCCESS}${NC}\n"
}

# Menu formatting
print_menu_header() {
    local title=$1
    echo -e "\n${BLUE}${BOLD}╔══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}${BOLD}║${NC}${WHITE}    $title${NC}${BLUE}${BOLD}    ║${NC}"
    echo -e "${BLUE}${BOLD}╚══════════════════════════════════════╝${NC}\n"
}

print_menu_item() {
    local number=$1
    local description=$2
    local icon=$3
    
    echo -e "${WHITE}${BOLD}[$number]${NC} ${icon} $description"
}

print_separator() {
    echo -e "${DIM}─────────────────────────────────────${NC}"
}