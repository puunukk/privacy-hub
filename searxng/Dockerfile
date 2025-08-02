FROM searxng/searxng:latest

# Disable logging to save SD card  
RUN mkdir -p /var/log/searxng && \
    ln -sf /dev/null /var/log/searxng/searxng.log

# Create the directory that will be mounted
RUN mkdir -p /etc/searxng && chown -R searxng:searxng /etc/searxng

EXPOSE 8080

# Default SearXNG command
CMD ["searxng-run"] 