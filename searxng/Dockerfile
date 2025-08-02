FROM searxng/searxng:latest

# Copy custom settings
COPY settings.yml /etc/searxng/settings.yml

# Create directory for user settings
RUN mkdir -p /etc/searxng

# Disable logging to save SD card
RUN mkdir -p /var/log/searxng && \
    ln -sf /dev/null /var/log/searxng/searxng.log

# Use non-root user for security
USER searxng

EXPOSE 8080

CMD ["searxng", "--config", "/etc/searxng/settings.yml"] 