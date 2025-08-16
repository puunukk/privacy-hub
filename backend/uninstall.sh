#!/bin/bash

# Privacy Hub Backend Uninstallation Script

set -e

SERVICE_NAME="privacy-hub-backend"
INSTALL_DIR="/opt/privacy-hub"

echo "🗑️ Privacy Hub Backend Uninstallation Script"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Stop and disable service
echo "🛑 Stopping and disabling service..."
systemctl stop $SERVICE_NAME 2>/dev/null || true
systemctl disable $SERVICE_NAME 2>/dev/null || true

# Remove systemd service file
echo "🗂️ Removing systemd service..."
rm -f /etc/systemd/system/$SERVICE_NAME.service
systemctl daemon-reload

# Remove binary and installation directory
echo "📁 Removing installation files..."
rm -rf $INSTALL_DIR

# Remove user and group (only if no other files owned by them)
echo "👤 Removing user and group..."
if id "privacy-hub" &>/dev/null; then
    # Check if user owns any other files
    if ! find / -user privacy-hub 2>/dev/null | grep -v "$INSTALL_DIR" | head -1; then
        userdel privacy-hub 2>/dev/null || true
    else
        echo "⚠️ User 'privacy-hub' owns other files, not removing"
    fi
fi

echo ""
echo "✅ Uninstallation completed successfully!"
echo "📋 The Privacy Hub Backend has been completely removed from the system."
