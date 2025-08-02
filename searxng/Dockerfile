FROM searxng/searxng:latest

# Disable logging to save SD card  
RUN mkdir -p /var/log/searxng && \
    ln -sf /dev/null /var/log/searxng/searxng.log

# Create the directory that will be mounted
RUN mkdir -p /etc/searxng && chown -R searxng:searxng /etc/searxng

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

# Use our entrypoint script
CMD ["/entrypoint.sh"] 