#!/bin/bash
# User interaction and prompt utilities

# Source colors for formatting
source "$(dirname "${BASH_SOURCE[0]}")/colors.sh" 2>/dev/null || {
    RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
    EMOJI_QUESTION="❓"; EMOJI_ERROR="❌"
}

# Prompt with default value
prompt_with_default() {
    local prompt_text="$1"
    local default_value="$2"
    local variable_name="$3"
    local user_input
    
    echo -n -e "${BLUE}${EMOJI_QUESTION} $prompt_text [${GREEN}$default_value${NC}${BLUE}]: ${NC}"
    read -r user_input
    
    if [ -z "$user_input" ]; then
        export $variable_name="$default_value"
    else
        export $variable_name="$user_input"
    fi
}

# Yes/No confirmation
confirm() {
    local message="$1"
    local default="${2:-n}"
    local response
    
    while true; do
        if [ "$default" = "y" ]; then
            echo -n -e "${BLUE}${EMOJI_QUESTION} $message [Y/n]: ${NC}"
        else
            echo -n -e "${BLUE}${EMOJI_QUESTION} $message [y/N]: ${NC}"
        fi
        
        read -r response
        
        # Use default if empty
        if [ -z "$response" ]; then
            response="$default"
        fi
        
        case "$response" in
            [Yy]|[Yy][Ee][Ss])
                return 0
                ;;
            [Nn]|[Nn][Oo])
                return 1
                ;;
            *)
                print_error "Please answer yes or no (y/n)"
                ;;
        esac
    done
}

# Menu selection
select_from_menu() {
    local title="$1"
    shift
    local options=("$@")
    local choice
    
    print_menu_header "$title"
    
    for i in "${!options[@]}"; do
        echo -e "${WHITE}${BOLD}[$((i+1))]${NC} ${options[i]}"
    done
    
    echo ""
    while true; do
        echo -n -e "${BLUE}${EMOJI_QUESTION} Select option [1-${#options[@]}]: ${NC}"
        read -r choice
        
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
            return $((choice-1))
        else
            print_error "Invalid selection. Please choose 1-${#options[@]}"
        fi
    done
}

# Password prompt (hidden input)
prompt_password() {
    local prompt_text="$1"
    local variable_name="$2"
    local password
    local confirm_password
    
    while true; do
        echo -n -e "${BLUE}${EMOJI_QUESTION} $prompt_text: ${NC}"
        read -s password
        echo ""
        
        echo -n -e "${BLUE}${EMOJI_QUESTION} Confirm password: ${NC}"
        read -s confirm_password
        echo ""
        
        if [ "$password" = "$confirm_password" ]; then
            export $variable_name="$password"
            break
        else
            print_error "Passwords do not match. Please try again."
        fi
    done
}

# Wait for user to press Enter
press_enter() {
    local message="${1:-Press Enter to continue...}"
    echo -n -e "${DIM}$message${NC}"
    read -r
}

# Multi-line input
prompt_multiline() {
    local prompt_text="$1"
    local variable_name="$2"
    local input=""
    local line
    
    echo -e "${BLUE}${EMOJI_QUESTION} $prompt_text${NC}"
    echo -e "${DIM}(Enter empty line to finish)${NC}"
    
    while IFS= read -r line; do
        [ -z "$line" ] && break
        input+="$line"$'\n'
    done
    
    export $variable_name="${input%$'\n'}"
}

# Validate IP address
validate_ip() {
    local ip=$1
    local regex='^([0-9]{1,3}\.){3}[0-9]{1,3}$'
    
    if [[ $ip =~ $regex ]]; then
        IFS='.' read -ra parts <<< "$ip"
        for part in "${parts[@]}"; do
            if [ "$part" -gt 255 ]; then
                return 1
            fi
        done
        return 0
    fi
    return 1
}

# Validate hostname
validate_hostname() {
    local hostname=$1
    local regex='^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$'
    
    [[ $hostname =~ $regex ]] && [ ${#hostname} -le 63 ]
}

# Loading animation
show_loading() {
    local message="$1"
    local duration="${2:-3}"
    local spinner='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    local end_time=$((SECONDS + duration))
    
    echo -n -e "${BLUE}$message${NC} "
    while [ $SECONDS -lt $end_time ]; do
        printf "\r${BLUE}$message${NC} ${spinner:$i:1}"
        i=$(( (i+1) %10 ))
        sleep 0.1
    done
    printf "\r${BLUE}$message${NC} ${GREEN}✅${NC}\n"
}