FROM nginx:alpine

# Install OpenSSL for self-signed certificates
RUN apk add --no-cache openssl

# Copy configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create SSL directory (certificates will be mounted from host)
RUN mkdir -p /etc/nginx/ssl

# Disable access logs (save SD card)
RUN ln -sf /dev/null /var/log/nginx/access.log

EXPOSE 53 80 443

CMD ["nginx", "-g", "daemon off;"] 