#!/bin/bash

# Privacy Hub Backend Container Runner
# This script runs the backend container with proper host mounts for system monitoring

CONTAINER_NAME="privacy-hub-backend"
IMAGE_NAME="privacy-hub-backend"
PORT="8111"

echo "🔒 Starting Privacy Hub Backend Container..."

# Stop and remove existing container if running
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run the container with host networking and mounts for system monitoring
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  --network host \
  --privileged \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc:/host/etc:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  $IMAGE_NAME

echo "✅ Container started successfully!"
echo "📊 Backend available at: http://localhost:$PORT"
echo "🔍 Debug info available at: http://localhost:$PORT/debug"
echo "💚 Health check: http://localhost:$PORT/health"

# Show container logs
echo ""
echo "📋 Container logs:"
docker logs $CONTAINER_NAME
