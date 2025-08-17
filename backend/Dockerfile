# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go files
COPY go.mod ./
COPY cmd/ ./cmd/
COPY internal/ ./internal/

# Download dependencies and build
RUN go mod download && CGO_ENABLED=0 GOOS=linux go build -o privacy-hub-backend cmd/main.go

# Runtime stage  
FROM alpine:latest

# Install system tools needed for commands
RUN apk --no-cache add iproute2 util-linux

WORKDIR /app

# Copy binary from build stage
COPY --from=builder /app/privacy-hub-backend .

# Make executable
RUN chmod +x privacy-hub-backend

# Create mount points for host access
RUN mkdir -p /host/proc /host/sys /host/etc /hostfs/proc /hostfs/sys /hostfs/etc /mnt/host/proc /mnt/host/sys /mnt/host/etc

# Expose port
EXPOSE 8111

# Run the service
CMD ["./privacy-hub-backend"]