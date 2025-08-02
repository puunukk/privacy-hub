FROM nginx:alpine

# Install OpenSSL for self-signed certificates
RUN apk add --no-cache openssl

# Copy configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create SSL directory (certificates will be mounted from host)
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed certificate for local network
# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout /etc/nginx/ssl/nginx.key \
#     -out /etc/nginx/ssl/nginx.crt \
#     -subj "/C=FI/ST=State/L=City/O=Home/CN=*.local"

# Disable access logs (save SD card)
RUN ln -sf /dev/null /var/log/nginx/access.log

EXPOSE 53 80 443

CMD ["nginx", "-g", "daemon off;"] 