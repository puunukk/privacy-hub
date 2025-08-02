# 🥧 Raspberry Pi Setup Guide for Privacy Hub

## 📋 **Prerequisites**

### Hardware Requirements
- **Raspberry Pi 4** (recommended) or Pi 3B+
- **32GB+ MicroSD Card** (Class 10 or better)
- **Stable internet connection**
- **Router admin access** (for DNS configuration)

### Software Requirements
- **Raspberry Pi OS Lite** (64-bit recommended)
- **Docker & Docker Compose**

---

## 🔄 **Access Methods: Hostname vs IP Address**

**Privacy Hub supports both access methods - choose what works best for your setup:**

### 🏷️ **Hostname Access** (`https://otsi.local`)
✅ **User-friendly** - Easy to remember  
✅ **Professional** - Looks like a real website  
✅ **Portable** - Works even if IP changes  
⚠️ **Requires** - DHCP reservation setup in router  

### 🔢 **IP Address Access** (`https://192.168.1.100`)
✅ **Always works** - No router configuration needed  
✅ **Immediate** - Available right after setup  
✅ **Simple** - Direct network access  
⚠️ **Changes** - If Pi gets different IP address  

💡 **Recommendation**: Set up both! Use IP initially, then add hostname for better user experience.

---

## 🚀 **Step 1: Prepare Raspberry Pi**

### 1.1 Flash Raspberry Pi OS
```bash
# Download Raspberry Pi Imager
# Flash "Raspberry Pi OS Lite (64-bit)" to SD card
# ⚠️ IMPORTANT: Click gear icon for advanced settings:
#   ✅ Set hostname: otsi
#   ✅ Enable SSH
#   ✅ Set username: pi, password: (your choice)
#   ✅ Configure WiFi (if needed)
#   ✅ Set locale settings
```

💡 **Pro Tip**: Setting hostname to "otsi" allows access via `https://otsi.local` instead of remembering IP addresses!

### 1.2 First Boot Setup
```bash
# SSH into your Pi (choose your preferred method):
ssh pi@otsi.local          # Using hostname (recommended)
# OR
ssh pi@192.168.1.100       # Using IP address

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y git curl vim htop
```

---

## 🐳 **Step 2: Install Docker**

```bash
# Install Docker (includes Docker Compose V2)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add pi user to docker group
sudo usermod -aG docker pi

# Verify Docker Compose is installed (should come with Docker)
docker compose version

# If Docker Compose is not available, install it manually
if ! docker compose version > /dev/null 2>&1; then
    echo "Installing Docker Compose manually..."
    sudo apt update
    sudo apt install -y docker-compose-plugin
fi

# Clean up
rm get-docker.sh

# Reboot to apply group changes
sudo reboot
```

---

## 📁 **Step 3: Deploy Privacy Hub**

### 3.1 Clone Repository
```bash
# Clone your privacy-hub repository
git clone https://github.com/your-username/privacy-hub.git
cd privacy-hub

# Make scripts executable
chmod +x scripts/*.sh
```

### 3.2 Configure and Deploy
```bash
# Step 1: Interactive configuration (creates .env file)
./scripts/configure.sh

# Step 2: Deploy containers
./scripts/setup.sh
```

The configuration script will:
- ✅ Auto-detect Pi's IP address
- ✅ Prompt for hostname and settings
- ✅ Generate secure passwords
- ✅ Create .env configuration file

The setup script will:
- ✅ Create necessary directories
- ✅ Generate secure SearXNG secret key
- ✅ Build all Docker containers
- ✅ Start all services
- ✅ Generate SSL certificates

---

## 🌐 **Step 4: Configure Router DNS**

### Step 4.1: Set Fixed IP Address (Highly Recommended)
1. **Access router admin panel** (usually `192.168.1.1`)
2. **Find DHCP Reservations** or **Static IP** settings
3. **Find your Pi** in connected devices (hostname: "otsi")
4. **Note the MAC address** (usually starts with DC:A6:32, E4:5F:01, or B8:27:EB for Pi)
5. **Create DHCP reservation**: Assign Pi's MAC to fixed IP (e.g., `192.168.1.100`)
6. **Save settings**

💡 **Why Fixed IP?** Prevents IP changes that would break DNS configuration.

### Step 4.2: Router-wide DNS (Recommended)
1. **Find DNS/DHCP settings** in router admin
2. **Set Primary DNS**: `YOUR_PI_FIXED_IP` (e.g., `192.168.1.100`)
3. **Set Secondary DNS**: `1.1.1.1`
4. **Save and reboot router**

### Option B: Device-specific DNS
On each device, manually set DNS to your Pi's IP address.

🎯 **Result**: All devices automatically get ad-blocking + you can use both `otsi.local` hostname AND IP access!

---

## 🔧 **Step 5: Access Your Privacy Hub**

After setup completes, you'll see:

```
🎉 Privacy Hub is ready!

🔍 Search (Homepage): https://otsi.local (or https://192.168.1.100)
🛡️ Pi-hole Admin: https://otsi.local/admin (or https://192.168.1.100/admin)
❤️ Health Check: https://otsi.local/health (or https://192.168.1.100/health)
```

### First Access - Choose Your Preferred Method

#### Option A: Using Hostname (Recommended)
1. **Open browser** → `https://otsi.local`
2. **Accept SSL warning** (self-signed certificate - this is safe!)
3. **Bookmark** for easy access

#### Option B: Using IP Address
1. **Open browser** → `https://192.168.1.100` (use your actual Pi IP)
2. **Accept SSL warning** (self-signed certificate - this is safe!)
3. **Bookmark** for easy access

💡 **Pro Tip**: Hostname approach is more user-friendly, but IP addresses work immediately without router configuration.

---

## 🛠️ **Daily Management**

### Check Status
```bash
./scripts/manage.sh status
```

### View Logs
```bash
./scripts/manage.sh logs          # All services
./scripts/manage.sh logs pihole   # Specific service
```

### Restart Services
```bash
./scripts/manage.sh restart           # All services
./scripts/manage.sh restart searxng   # Specific service
```

### Update Containers
```bash
./scripts/manage.sh update
```

### Create Backup
```bash
./scripts/manage.sh backup
```

---

## 🔒 **Security & Firewall**

### Enable UFW Firewall
```bash
# Install and configure firewall
sudo ufw allow 22      # SSH
sudo ufw allow 53      # DNS
sudo ufw allow 80      # HTTP (redirects to HTTPS)
sudo ufw allow 443     # HTTPS

sudo ufw --force enable
sudo ufw status
```

### Change Default Passwords
```bash
# Edit Pi-hole password in docker-compose.yml
nano docker-compose.yml
# Change WEBPASSWORD: 'secure123' to something stronger

# Restart Pi-hole
./scripts/manage.sh restart pihole
```

---

## 📊 **Monitoring & Troubleshooting**

### Check Service Health
```bash
# Quick health check
curl -k https://localhost/health

# Detailed container status
docker-compose ps

# Resource usage
htop
```

### Common Issues

#### Services won't start
```bash
# Check logs
./scripts/manage.sh logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### DNS not working
```bash
# Test DNS resolution
nslookup google.com localhost

# Check Pi-hole logs
./scripts/manage.sh logs pihole
```

#### Can't access web interface
```bash
# Check NGINX logs
./scripts/manage.sh logs nginx

# Verify SSL certificates
ls -la nginx/ssl/
```

---

## 🎯 **Performance Optimization**

### For SD Card Health
```bash
# Monitor SD card usage
df -h

# Check I/O stats
sudo iotop
```

### For Better Performance
```bash
# Increase swap (if needed)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile  # Set CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

---

## 🔄 **Updates & Maintenance**

### Weekly Maintenance
```bash
# Update Pi-hole blocklists
docker exec pihole pihole -g

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update containers
./scripts/manage.sh update

# Create backup
./scripts/manage.sh backup
```

### Monthly Tasks
- Check SD card health
- Review Pi-hole blocked queries stats
- Update router firmware
- Test failover DNS

---

## 🏠 **For Airbnb/Guest Networks**

### Guest Instructions

#### Option A: Using Hostname (if DHCP reservation set)
```markdown
📱 **WiFi Password**: [your-wifi-password]

🔍 **Private Search**: https://otsi.local
   - No tracking, private search
   - Ad-free browsing automatically

⚠️ **SSL Warning**: Click "Advanced" → "Proceed" (safe, local certificate)
```

#### Option B: Using IP Address
```markdown
📱 **WiFi Password**: [your-wifi-password]

🔍 **Private Search**: https://192.168.1.100
   - No tracking, private search  
   - Ad-free browsing automatically

⚠️ **SSL Warning**: Click "Advanced" → "Proceed" (safe, local certificate)
```

### Host Benefits
- ✅ **Network-wide ad blocking** for all guests
- ✅ **Private search** without tracking
- ✅ **Reduced bandwidth** usage (blocked ads)
- ✅ **Professional setup** impression

---

## 🆘 **Emergency Commands**

```bash
# Stop everything
./scripts/manage.sh stop

# Start everything
./scripts/manage.sh start

# Complete reset (keeps data)
docker-compose down
docker-compose up -d

# Nuclear option (DELETES DATA)
docker-compose down -v
./scripts/setup.sh
```

---

## 📞 **Support & Links**

- **Project Repository**: https://github.com/your-username/privacy-hub
- **Pi-hole Documentation**: https://docs.pi-hole.net/
- **SearXNG Documentation**: https://docs.searxng.org/
- **Docker Documentation**: https://docs.docker.com/

---

**🎉 Your Privacy Hub is now ready to protect your entire network!** 