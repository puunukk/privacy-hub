FROM pihole/pihole:latest

# Copy custom configurations and entrypoint
COPY custom.list /etc/pihole/custom.list
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Disable excessive logging
RUN echo 'log-queries=no' >> /etc/dnsmasq.conf

# Custom blocklists
RUN echo 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts' >> /etc/pihole/adlists.list

# Configure for reverse proxy
ENV VIRTUAL_HOST=pihole.local

# Only expose DNS service (port 53) and web interface (port 80)
EXPOSE 53/tcp 53/udp 80/tcp

CMD ["/entrypoint.sh", "pihole", "-f"] 