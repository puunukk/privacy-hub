# 🛡️ Privacy Hub - Local Network Privacy Gateway

**Transform your Raspberry Pi into a powerful privacy-focused network gateway providing ad-blocking and private search for your entire home network.**

![Privacy Hub Architecture](https://img.shields.io/badge/Architecture-Secure%20Reverse%20Proxy-green)
![Pi-hole](https://img.shields.io/badge/Pi--hole-DNS%20Ad%20Blocking-blue)
![SearXNG](https://img.shields.io/badge/SearXNG-Private%20Search-orange)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)

## 🎯 **What is Privacy Hub?**

Privacy Hub is a **complete local network privacy solution** that runs on a Raspberry Pi 4, providing:

- 🛡️ **Network-wide ad blocking** - Block ads, trackers, and malware for all devices
- 🔍 **Private search engine** - Google-like search without tracking via SearXNG  
- 🔒 **Secure HTTPS access** - Automatic local SSL certificates
- 🏗️ **Professional architecture** - NGINX reverse proxy with container isolation
- 📱 **Zero device configuration** - Works automatically for all connected devices
- 🌐 **Local network focus** - Designed for home/office networks

Perfect for **home networks**, **small offices**, or anywhere you want **privacy-by-default**.

## 🏗️ **Architecture Overview**

```
Your Devices → Router → Raspberry Pi 4 (Privacy Hub) → Internet
                           ↓
                    NGINX (Ports 53, 80, 443)
                           ↓
              ┌─────────────────────────────────┐
              │     Internal Docker Network     │
              │                                 │
              │  Pi-hole:80     SearXNG:8080    │
              │  (DNS + Admin)  (Search)        │
              └─────────────────────────────────┘
```

### **Network Flow:**
1. **DNS Queries** → Pi-hole (blocks ads/trackers)
2. **Web Traffic** → NGINX → Pi-hole admin or SearXNG search
3. **All Services** → Isolated containers, only NGINX exposed

## 🚀 **Quick Start (Raspberry Pi 4)**

### **Prerequisites:**
- Raspberry Pi 4 (2GB+ RAM recommended)
- Raspbian OS or Ubuntu Server
- Docker & Docker Compose installed
- Static IP on your local network

### **Installation:**
```bash
# Clone the repository
git clone https://github.com/your-username/privacy-hub.git
cd privacy-hub

# Configure environment (auto-generates secure passwords)
./configure

# Deploy privacy hub
./setup
```

### **Router Configuration:**
1. Set **DHCP reservation** for your Pi's MAC address
2. Set **router DNS** to your Pi's IP address  
3. All devices will now use privacy-protected DNS

## 🛠️ **Management Commands**

Privacy Hub includes comprehensive management tools:

### **Main Management:**
```bash
./manage status      # Check all services
./manage restart     # Restart all services  
./manage logs        # View service logs
./manage password    # Reset Pi-hole password
./manage ssl         # Update SSL certificates
```

### **Troubleshooting:**
```bash
./manage diagnose          # Full system diagnostics
./manage network           # Fix network connectivity
./manage debug             # Deep debugging tools
```

### **Configuration:**
```bash
./configure                   # Reconfigure environment
./manage ssl                  # Upgrade SSL certificates
```

## 🌐 **Access Your Services**

After installation, access your privacy hub:

- **🔍 Private Search**: `https://your-pi-ip/` or `https://hostname.local/`
- **🛡️ Pi-hole Admin**: `https://your-pi-ip/admin`  
- **❤️ Health Check**: `https://your-pi-ip/health`

**Default password**: Auto-generated and displayed during setup

## 🔧 **Key Features**

### **🔐 Security First**
- **Single entry point** - Only NGINX exposed to network
- **Container isolation** - Pi-hole & SearXNG not directly accessible  
- **HTTPS everywhere** - Local SSL certificates for encrypted access
- **Minimal attack surface** - Enterprise reverse proxy architecture

### **🚀 Easy Management**
- **One-command deployment** - Automated installation
- **Auto-configuration** - Detects network settings automatically
- **Secure passwords** - Auto-generated strong passwords
- **Health monitoring** - Built-in diagnostics and status checks

### **🛠️ Raspberry Pi Optimized**
- **SD card protection** - Minimal logging and RAM-based temporary files
- **Resource efficient** - Optimized for Pi 4 hardware
- **Container-based** - Easy updates and rollbacks
- **Network performance** - DNS caching and optimized routing

## 📊 **Performance & Benefits**

### **Network-wide Protection:**
- ✅ **Ad blocking**: 90%+ reduction in ads across all devices
- ✅ **Tracker blocking**: Prevent behavioral profiling and data collection
- ✅ **Malware protection**: Block known malicious domains
- ✅ **Faster browsing**: Reduced bandwidth usage and faster page loads

### **Private Search:**
- ✅ **No tracking**: Search without building user profiles
- ✅ **Multiple sources**: Aggregates results from Google, Bing, DuckDuckGo
- ✅ **Local processing**: All search requests processed on your network
- ✅ **Fast results**: Local caching for improved performance

## 🔧 **Advanced Configuration**

### **Environment Variables:**
```bash
# Core settings (auto-generated)
SERVER_IP=192.168.1.120
HOSTNAME=privacy-hub
PIHOLE_PASSWORD=auto-generated

# SearXNG customization  
SEARXNG_DEFAULT_THEME=simple
SEARXNG_SAFE_SEARCH=1
SEARXNG_DEFAULT_LANG=en
```

### **Custom DNS Blocking:**
Add custom domains to block in Pi-hole admin interface or via:
```bash
docker exec pihole pihole -b example.com
```

### **SSL Certificate Management:**
```bash
# Upgrade to mkcert-generated certificates (no browser warnings)
./manage ssl

# Manual certificate generation
docker exec nginx openssl req -x509 -nodes -days 365 ...
```

## 🐛 **Troubleshooting**

### **Common Issues:**

**DNS not working:**
```bash
./scripts/diagnose.sh           # Check system status
./scripts/manage.sh network     # Fix network issues
```

**Pi-hole admin login fails:**
```bash
./scripts/manage.sh password    # Reset password
./scripts/diagnose.sh           # Check authentication
```

**SSL certificate warnings:**
```bash
./scripts/upgrade-ssl.sh        # Install trusted certificates
```

**Services not starting:**
```bash
./scripts/manage.sh logs        # Check error logs
./scripts/manage.sh restart     # Restart services
```

## 📂 **Project Structure**

```
privacy-hub/
├── README.md                   # This file
├── docker-compose.yml          # Service orchestration  
├── .env                        # Environment configuration (auto-generated)
├── scripts/                    # Management tools
│   ├── configure.sh           # Environment setup      # old! #
│   ├── setup.sh               # Main deployment        # old! #
│   ├── manage.sh              # Service management     # old! #
│   ├── diagnose.sh            # System diagnostics
│   └── upgrade-ssl.sh         # SSL certificate management
├── configure                   # Interactive environment setup
├── setup                       # Automated deployment
├── manage                      # Interactive management
├── scripts/                    # Internal helpers (core/, services/, utils/)
├── nginx/                      # Reverse proxy configuration
│   ├── nginx.conf             # Main proxy configuration
│   ├── Dockerfile             # Custom nginx build
│   └── ssl/                   # SSL certificates (auto-generated)
├── pihole/                     # DNS ad-blocking service
│   ├── Dockerfile             # Custom Pi-hole build
│   ├── custom.list            # Local DNS overrides
│   └── data/                  # Pi-hole configuration storage
└── searxng/                    # Private search engine
    ├── Dockerfile             # Custom SearXNG build
    ├── settings.yml           # Search engine configuration
    └── data/                  # SearXNG instance data
```

## 🤝 **Contributing**

This project is designed to be easily customizable for different use cases:

- **Home networks** - Complete family privacy protection
- **Small offices** - Professional ad-blocking and search
- **Developer environments** - Local testing with privacy
- **Educational use** - Learn about network security and privacy

### **Customization Ideas:**
- Add additional blocklists for specific regions
- Integrate with VPN services for external access
- Add monitoring and alerting capabilities
- Extend with additional privacy services

## 📄 **License**

MIT License - See LICENSE file for details.

## 🔗 **Useful Links**

- [Pi-hole Documentation](https://docs.pi-hole.net/)
- [SearXNG Documentation](https://docs.searxng.org/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)