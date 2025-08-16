#!/bin/bash

# Privacy Hub Backend Installation Script
# This script builds the binary and installs it as a systemd service

set -e

VERSION=$(cat VERSION)
BINARY_NAME="privacy-hub-backend"
SERVICE_NAME="privacy-hub-backend"
INSTALL_DIR="/opt/privacy-hub"
SERVICE_FILE="privacy-hub-backend.service"

echo "🔒 Privacy Hub Backend Installation Script"
echo "📦 Version: $VERSION"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Build the binary
echo "🔨 Building binary..."
docker build -f Dockerfile.build -t privacy-hub-builder .

# Create temporary container to extract binary
echo "📦 Extracting binary..."
mkdir -p /tmp/privacy-hub-build
docker run --rm -v /tmp/privacy-hub-build:/output privacy-hub-builder

# Create user and group if they don't exist
echo "👤 Setting up user and group..."
if ! id "privacy-hub" &>/dev/null; then
    useradd -r -s /bin/false -d /opt/privacy-hub privacy-hub
fi

# Create installation directory
echo "📁 Creating installation directory..."
mkdir -p $INSTALL_DIR
cp /tmp/privacy-hub-build/$BINARY_NAME $INSTALL_DIR/
chown privacy-hub:privacy-hub $INSTALL_DIR/$BINARY_NAME
chmod +x $INSTALL_DIR/$BINARY_NAME

# Install systemd service
echo "⚙️ Installing systemd service..."
cp $SERVICE_FILE /etc/systemd/system/
systemctl daemon-reload

# Enable and start service
echo "🚀 Enabling and starting service..."
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Clean up
rm -rf /tmp/privacy-hub-build

echo ""
echo "✅ Installation completed successfully!"
echo "📊 Service status:"
systemctl status $SERVICE_NAME --no-pager -l

echo ""
echo "🔗 Service endpoints:"
echo "   Health: http://localhost:8111/health"
echo "   Metrics: http://localhost:8111/metrics"
echo "   Debug: http://localhost:8111/debug"
echo ""
echo "📋 Useful commands:"
echo "   View logs: journalctl -u $SERVICE_NAME -f"
echo "   Restart: systemctl restart $SERVICE_NAME"
echo "   Stop: systemctl stop $SERVICE_NAME"
echo "   Status: systemctl status $SERVICE_NAME"
