#!/bin/bash
# Pi-hole custom entrypoint to ensure password is set

# Start Pi-hole in background
/usr/local/bin/docker-entrypoint.sh "$@" &
PIHOLE_PID=$!

# Wait for Pi-hole to start up
echo "Waiting for Pi-hole to start..."
while ! curl -s http://localhost/admin/api.php?version > /dev/null; do
    sleep 2
    echo "Still waiting for Pi-hole..."
done

# Set the password if WEBPASSWORD is provided
if [ -n "$WEBPASSWORD" ]; then
    echo "Setting Pi-hole admin password..."
    pihole -a -p "$WEBPASSWORD"
    echo "Password set successfully!"
else
    echo "No WEBPASSWORD provided, using Pi-hole defaults"
fi

# Wait for Pi-hole process
wait $PIHOLE_PID