# 🏠 Privacy Hub - Self-Hosted Network Privacy Solution

**Transform your Raspberry Pi into a powerful privacy-focused network gateway that provides ad-blocking and private search for your entire home or Airbnb network.**

![Privacy Hub Architecture](https://img.shields.io/badge/Architecture-Secure%20Reverse%20Proxy-green)
![Pi-hole](https://img.shields.io/badge/Pi--hole-DNS%20Ad%20Blocking-blue)
![SearXNG](https://img.shields.io/badge/SearXNG-Private%20Search-orange)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)

## 🎯 **What is Privacy Hub?**

Privacy Hub is a **complete network privacy solution** that runs on a Raspberry Pi, providing:

- 🛡️ **Network-wide ad blocking** via Pi-hole DNS filtering
- 🔍 **Private search engine** via SearXNG (Google-like but no tracking)
- 🔒 **Secure HTTPS access** with automatic SSL certificates
- 🏗️ **Professional architecture** using NGINX reverse proxy
- 📱 **Zero device configuration** - works automatically for all connected devices

Perfect for **home networks**, **Airbnb properties**, or anywhere you want **privacy-by-default**.

## ✨ **Key Features**

### 🔐 **Security First**
- **Single entry point** - Only NGINX exposed to network
- **Internal service isolation** - Pi-hole & SearXNG not directly accessible
- **HTTPS everywhere** - Self-signed certificates for local encryption
- **Minimal attack surface** - Enterprise-grade reverse proxy setup

### 🚀 **Easy Deployment**
- **One-command setup** - Automated installation script
- **No hardcoded IPs** - Automatic network detection
- **Hostname-based access** - Use `https://otsi.local` instead of IP addresses
- **Router integration** - Simple DNS configuration

### 🛠️ **Built for Reliability**
- **SD card optimized** - Minimal logging to preserve storage
- **Container-based** - Easy updates and rollbacks
- **Health monitoring** - Built-in status endpoints
- **Backup system** - Configuration backup tools

## 🌊 **Network Flow**

```
External Network → Pi (ONLY 53, 80, 443)
                    ↓
                  NGINX reverse proxy
                    ↓
  ┌─────────────────────────────────────┐
  │  Internal Docker Network            │
  │                                     │
  │  pihole:53,80  ←→  searxng:8080     │
  │  (not exposed)     (not exposed)    │
  └─────────────────────────────────────┘
```

## 🚀 **Quick Start**

### 1. **Prepare Raspberry Pi**
```bash
# Flash Raspberry Pi OS Lite (64-bit)
# In Pi Imager advanced settings:
# ✅ Set hostname: otsi
# ✅ Enable SSH
# ✅ Set username: pi
```

### 2. **Install Dependencies**
```bash
ssh pi@otsi.local

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker pi
sudo reboot
```

### 3. **Deploy Privacy Hub**
```bash
git clone https://github.com/your-username/privacy-hub.git
cd privacy-hub
chmod +x scripts/*.sh
./scripts/setup.sh
```

### 4. **Configure Router**
- **Router DNS**: Set to Pi's IP address  
- **Fixed IP**: Reserve Pi's MAC address for static IP (enables hostname access)

### 5. **Access Services**
- 🔍 **Search Homepage**: `https://otsi.local` or `https://your-pi-ip`
- 🛡️ **Pi-hole Admin**: `https://otsi.local/admin` or `https://your-pi-ip/admin`
- ❤️ **Health Check**: `https://otsi.local/health` or `https://your-pi-ip/health`

## 📱 **User Experience**

### For Family/Home Network
- **Automatic ad blocking** on all devices (phones, tablets, smart TVs)
- **Private search** as default homepage
- **No app installations** required
- **Works with everything** that connects to WiFi

### For Airbnb Hosts
- **Professional impression** with custom search portal
- **Reduced bandwidth usage** from blocked ads
- **Privacy-focused amenity** for tech-savvy guests
- **Set-and-forget** operation

### Example Guest Instructions
```markdown
📱 WiFi: YourNetwork / password123

🔍 Private Search: https://otsi.local (or https://192.168.1.100)
   → No tracking, no ads, fast results

⚠️ Security Notice: Click "Accept" on SSL warning (safe, local certificate)
```

## 🏗️ **Architecture Benefits**

✅ **Enterprise-grade security** - Same setup used by major companies  
✅ **Zero configuration** - Works on any network automatically  
✅ **Scalable design** - Easy to add more services later  
✅ **Privacy by default** - No data collection, all local processing  
✅ **Low maintenance** - Automated updates and monitoring  

## 📁 **Project Structure**

```
privacy-hub/
├── docker-compose.yml          # Service orchestration
├── nginx/                      # Reverse proxy & SSL
├── pihole/                     # DNS ad-blocking
├── searxng/                    # Private search engine
├── scripts/                    # Management tools
└── RASPBERRY_PI_SETUP.md       # Detailed setup guide
```

## 🛠️ **Management Commands**

```bash
# Check status
./scripts/manage.sh status

# View logs
./scripts/manage.sh logs

# Restart services
./scripts/manage.sh restart

# Update containers
./scripts/manage.sh update

# Create backup
./scripts/manage.sh backup
```

## 📋 **Requirements**

### Hardware
- **Raspberry Pi 4** (recommended) or Pi 3B+
- **32GB+ MicroSD Card** (Class 10+)
- **Network connection**
- **Router admin access**

### Software
- **Raspberry Pi OS Lite** (64-bit)
- **Docker & Docker Compose**
- **Basic terminal knowledge**

## 🎯 **Perfect For**

- 🏠 **Home networks** wanting privacy and ad-blocking
- 🏨 **Airbnb properties** offering premium internet experience  
- 👨‍💻 **Tech enthusiasts** learning network security
- 👨‍👩‍👧‍👦 **Families** protecting children from ads and tracking
- 🎓 **Educational purposes** understanding privacy technology

## 📚 **Documentation**

- **[Complete Setup Guide](RASPBERRY_PI_SETUP.md)** - Step-by-step instructions
- **[Pi-hole Documentation](https://docs.pi-hole.net/)** - DNS filtering details
- **[SearXNG Documentation](https://docs.searxng.org/)** - Search engine configuration

## 🤝 **Contributing**

Contributions welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

Built with amazing open-source projects:
- **[Pi-hole](https://pi-hole.net/)** - Network-wide ad blocking
- **[SearXNG](https://searxng.github.io/searxng/)** - Privacy-respecting search
- **[NGINX](https://nginx.org/)** - High-performance reverse proxy
- **[Docker](https://docker.com/)** - Containerization platform

---

**⭐ Star this repository if Privacy Hub helps protect your network!**

**🏠 Transform your Raspberry Pi into a privacy powerhouse today!**
