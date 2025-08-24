#!/bin/bash
# Pi-hole custom entrypoint

echo "=== Pi-hole Starting ==="
echo "Password configured: $([ -n "$WEBPASSWORD" ] && echo "YES" || echo "NO")"

# Use the standard Pi-hole entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"