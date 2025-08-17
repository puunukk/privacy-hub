#!/bin/bash

set -e

echo "🔨 Building Privacy Hub Backend..."

# Build the binary using Docker
docker build -f Dockerfile.build -t privacy-hub-backend-build .

# Create a temporary container to extract the binary
echo "📦 Extracting binary..."
CONTAINER_ID=$(docker create privacy-hub-backend-build)
docker cp $CONTAINER_ID:/privacy-hub-backend ./privacy-hub-backend
docker rm $CONTAINER_ID

# Make it executable
chmod +x ./privacy-hub-backend

# Create service directory
echo "📁 Installing service..."
sudo mkdir -p /opt/privacy-hub-backend
sudo cp ./privacy-hub-backend /opt/privacy-hub-backend/

# Create systemd service file
sudo tee /etc/systemd/system/privacy-hub-backend.service > /dev/null <<EOF
[Unit]
Description=Privacy Hub Backend Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/privacy-hub-backend
ExecStart=/opt/privacy-hub-backend/privacy-hub-backend
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=privacy-hub-backend

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/proc /sys /etc

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
echo "🚀 Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable privacy-hub-backend.service
sudo systemctl start privacy-hub-backend.service

# Check status
echo "📊 Service status:"
sudo systemctl status privacy-hub-backend.service --no-pager -l

echo "✅ Privacy Hub Backend installed and running as system service!"
echo "📍 Service runs on: http://localhost:8111"
echo "🔧 Manage with: sudo systemctl {start|stop|restart|status} privacy-hub-backend.service"
