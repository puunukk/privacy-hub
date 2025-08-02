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
Local Network → Pi (ONLY 53, 80, 443)
                    ↓
                  NGINX reverse proxy
                    ↓
  ┌─────────────────────────────────┐
  │ Internal Docker Network         │
  │                                 │
  │ pihole:53,80  ←→  searxng:8080  │
  │ (not exposed)     (not exposed) │
  └─────────────────────────────────┘
```

## 🚀 **Quick Start**

### 1. **Prepare Raspberry Pi**
```bash
# Flash Raspberry Pi OS Lite (64-bit)
# In Pi Imager advanced settings:
# ✅ Set hostname: otsi (or your preference)
# ✅ Enable SSH
# ✅ Set username: pi
```

### 2. **Install Dependencies**

**On your computer (for SSL without warnings):**
```bash
# Windows (PowerShell as Admin):
choco install mkcert
mkcert -install

# macOS:
brew install mkcert
mkcert -install

# Linux:
# Download from https://github.com/FiloSottile/mkcert/releases
mkcert -install
```

**On your Raspberry Pi:**
```bash
ssh pi@otsi.local

# Update system and install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker pi

# Install mkcert for trusted SSL certificates
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/arm64"
chmod +x mkcert-v*-linux-arm64
sudo mv mkcert-v*-linux-arm64 /usr/local/bin/mkcert
mkcert -install

sudo reboot
```

### 3. **Deploy Privacy Hub**
```bash
git clone https://github.com/your-username/privacy-hub.git
cd privacy-hub
chmod +x scripts/*.sh

# Step 1: Configure your setup
./scripts/configure.sh

# Step 2: Deploy the services
./scripts/setup.sh
```

### 4. **Configure Router DNS**
- **Router DNS**: Set to your Pi's IP address  
- **DHCP Reservation**: Reserve Pi's MAC for static IP (enables hostname access)

### 5. **Access Your Services**
After setup, access using either hostname or IP:
- 🔍 **Private Search**: `https://otsi.local` or `https://192.168.1.100`
- 🛡️ **Pi-hole Admin**: `https://otsi.local/admin` or `https://192.168.1.100/admin`
- ❤️ **Health Check**: `https://otsi.local/health` or `https://192.168.1.100/health`

> **Default Pi-hole password**: `secure123` (change during configuration!)

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

🛡️ Network Admin: https://otsi.local/admin (hosts only)

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
├── env.example                 # Environment configuration template
├── .gitignore                  # Git ignore rules
├── nginx/                      # Reverse proxy & SSL
├── pihole/                     # DNS ad-blocking
├── searxng/                    # Private search engine
├── scripts/
│   ├── configure.sh            # Interactive configuration setup
│   ├── setup.sh                # Container deployment
│   └── manage.sh               # Service management
├── RASPBERRY_PI_SETUP.md       # Detailed setup guide
└── Docs/                       # Extended documentation
```

## 🛠️ **Management Commands**

```bash
# Configuration
./scripts/configure.sh          # Interactive setup (first time)
cp env.example .env             # Manual configuration

# Deployment
./scripts/setup.sh              # Deploy containers

# Daily management
./scripts/manage.sh status      # Check service status
./scripts/manage.sh logs        # View service logs  
./scripts/manage.sh restart     # Restart all services
./scripts/manage.sh update      # Update containers
./scripts/manage.sh backup      # Create configuration backup
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
