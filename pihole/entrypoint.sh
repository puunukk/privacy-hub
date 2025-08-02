#!/bin/bash
# Pi-hole custom entrypoint - simplified approach

# Print debug info
echo "=== Pi-hole Entrypoint Debug ==="
echo "WEBPASSWORD is set: $([ -n "$WEBPASSWORD" ] && echo "YES" || echo "NO")"

# Just use the normal Pi-hole entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"