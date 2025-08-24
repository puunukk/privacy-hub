#!/bin/bash
# Pi-hole API setup script

echo "=== Setting up Pi-hole API Authentication ==="

# Set the password using pihole command
pihole -a -p "${WEBPASSWORD}"

# Get the API token/session
API_TOKEN=$(cat /etc/pihole/setupVars.conf | grep WEBPASSWORD | cut -d'=' -f2)

echo "Password set for Pi-hole admin interface"
echo "API authentication configured"

# Create a simple test to verify API is working
curl -s "http://localhost/api/auth" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"${WEBPASSWORD}\"}" | jq .

echo "=== Pi-hole API Setup Complete ==="