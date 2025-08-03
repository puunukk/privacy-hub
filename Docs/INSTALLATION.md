# 🚀 Complete Installation Guide

## 📋 **Prerequisites Checklist**

### **Hardware Requirements**
- ✅ **Raspberry Pi 4** (2GB+ RAM recommended, 1GB minimum)
- ✅ **MicroSD Card** (32GB+ Class 10 or better)
- ✅ **Ethernet Connection** (WiFi works but Ethernet preferred for stability)
- ✅ **Power Supply** (Official Pi 4 power adapter recommended)

### **Network Requirements**
- ✅ **Router admin access** (to configure DNS settings)
- ✅ **Static IP reservation** (for consistent Pi access)
- ✅ **Internet connection** (for downloading Docker images)

## 🖥️ **Step 1: Prepare Raspberry Pi OS**

### **Option A: Raspberry Pi Imager (Recommended)**

1. **Download Raspberry Pi Imager**:
   - 🪟 **Windows**: [Download from official site](https://www.raspberrypi.org/software/)
   - 🍎 **macOS**: `brew install --cask raspberry-pi-imager`
   - 🐧 **Linux**: `sudo apt install rpi-imager`

2. **Flash OS with Pre-configuration**:
   ```bash
   # Insert SD card and run Raspberry Pi Imager
   # Choose: "Raspberry Pi OS (64-bit)"
   # Click gear icon ⚙️ for advanced options:
   ```
   
   **Advanced Settings**:
   - ✅ Enable SSH (use password authentication)
   - ✅ Set username: `pi` password: `[your-choice]`
   - ✅ Configure wireless LAN (if using WiFi)
   - ✅ Set locale settings (timezone, keyboard)

3. **Boot & Connect**:
   ```bash
   # Insert SD card into Pi and boot
   # Find Pi IP address (check router or use):
   nmap -sn 192.168.1.0/24 | grep -B2 "Raspberry Pi"
   
   # SSH into your Pi
   ssh pi@[pi-ip-address]
   ```

### **Option B: Manual Configuration**

If you flashed a standard image:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Enable SSH (if not already enabled)
sudo systemctl enable ssh
sudo systemctl start ssh

# Set timezone
sudo timedatectl set-timezone [your-timezone]
# Example: sudo timedatectl set-timezone America/New_York
```

## 🐳 **Step 2: Install Docker**

### **Automated Docker Installation**

```bash
# Download and run Docker installer
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Restart session to apply group changes
exit
# SSH back in
ssh pi@[pi-ip-address]

# Verify installation
docker --version
docker compose version
```

### **Manual Docker Installation**

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt update
sudo apt install ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Test installation
sudo docker run hello-world
```

## 🌐 **Step 3: Configure Static IP**

### **Method A: Router DHCP Reservation (Recommended)**

1. **Find Pi MAC Address**:
   ```bash
   # Get MAC address
   ip link show | grep -A 1 "eth0\|wlan0"
   # Look for lines like: link/ether xx:xx:xx:xx:xx:xx
   ```

2. **Configure Router**:
   - Access router admin (usually `192.168.1.1` or `192.168.0.1`)
   - Go to **DHCP Settings** or **LAN Settings**
   - Add **DHCP Reservation**: `MAC Address → Static IP`
   - Choose IP like `192.168.1.100` (outside DHCP range)
   - **Save and reboot router**

### **Method B: Static IP on Pi**

```bash
# Edit network configuration
sudo nano /etc/dhcpcd.conf

# Add to end of file:
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=1.1.1.1 8.8.8.8

# Restart networking
sudo systemctl restart dhcpcd
```

## 🛡️ **Step 4: Deploy Privacy Hub**

### **Clone and Configure**

```bash
# Clone repository
git clone https://github.com/your-repo/privacy-hub.git
cd privacy-hub

# Make scripts executable
chmod +x configure setup manage

# Run interactive configuration
./configure
```

### **Configuration Options Explained**

During `./configure`, you'll be prompted for:

| Setting | Purpose | Recommendation |
|---------|---------|----------------|
| **Hostname** | Local network name | `privacy-hub` |
| **Local Domain** | Network suffix | `local` |
| **Timezone** | Log timestamps | Auto-detected |
| **SearXNG Theme** | Search interface look | `simple` (clean, dark) |
| **Safe Search** | Content filtering | `1` (moderate) |
| **Language** | Search language | `en` (English) |

### **Deploy Services**

```bash
# Deploy all services
./setup

# Monitor deployment
./manage status
```

## 📡 **Step 5: Configure Router DNS**

### **Router Configuration Steps**

1. **Access Router Admin Panel**:
   ```
   # Common router addresses:
   http://192.168.1.1    # Most common
   http://192.168.0.1    # Alternative
   http://10.0.0.1       # Some ISPs
   ```

2. **Navigate to DNS Settings**:
   - Look for: **DNS**, **DHCP**, **LAN Settings**, or **Internet**
   - Find: **DNS Server**, **Name Server**, or **Domain Name Server**

3. **Set DNS Servers**:
   ```
   Primary DNS:   [your-pi-ip]        # e.g., 192.168.1.100
   Secondary DNS: 1.1.1.1             # Cloudflare (fallback)
   ```

4. **Save and Restart Router**

### **Router Brand Specific Guides**

<details>
<summary><strong>🔧 Common Router Interfaces</strong></summary>

**Netgear**:
- Advanced → Setup → Internet Setup → DNS Servers

**Linksys**:
- Smart Wi-Fi Tools → Internet → Static DNS

**TP-Link**:
- Advanced → Network → Internet → Use Custom DNS

**ASUS**:
- Adaptive QoS → DNS Filter → Global Filter Mode

**D-Link**:
- Setup → Internet → Manual → DNS
</details>

## ✅ **Step 6: Verification & Testing**

### **Test Network Connectivity**

```bash
# Run comprehensive diagnostics
./manage diagnose

# Check specific services
./manage status

# Test web interfaces
curl -k https://[pi-ip]/health
```

### **Test from Client Device**

1. **Restart device** (to get new DNS settings)
2. **Visit blocked site**: `http://doubleclick.net` (should be blocked)
3. **Access services**:
   - 🔍 **Search**: `https://[pi-ip]/`
   - 🛡️ **Pi-hole**: `https://[pi-ip]/admin`

### **Verify DNS Blocking**

```bash
# From any device on network:
nslookup doubleclick.net
# Should return: 0.0.0.0 (blocked)

nslookup google.com  
# Should return: real IP (allowed)
```

## 🔧 **Troubleshooting Installation Issues**

### **Common Issues**

| Problem | Symptoms | Solution |
|---------|----------|----------|
| 🔴 **Docker permission denied** | `permission denied while trying to connect` | `sudo usermod -aG docker $USER` then logout/login |
| 🔴 **Port already in use** | `bind: address already in use` | Stop conflicting services or change ports |
| 🔴 **DNS not working** | Websites won't load | Check router DNS configuration |
| 🔴 **Can't access web interface** | Connection refused/timeout | Check Pi IP and firewall |
| 🟡 **SSL certificate warnings** | Browser security warnings | Normal for self-signed certs, click proceed |

### **Diagnostic Commands**

```bash
# Check Docker status
sudo systemctl status docker

# Check port usage
sudo netstat -tulpn | grep -E ':(53|80|443)'

# Check container status
docker compose ps

# View service logs
./manage logs

# Test network connectivity
ping 8.8.8.8
ping [router-ip]
```

### **Reset Installation**

```bash
# Stop all services
./manage stop

# Remove containers and data
docker compose down -v

# Re-run setup
./setup
```

## 🎯 **Next Steps**

After successful installation:

1. **📚 Read**: [Network Architecture Guide](NETWORK_ARCHITECTURE.md)
2. **🔧 Customize**: [Pi-hole Configuration](PI_HOLE_GUIDE.md)
3. **🔍 Optimize**: [SearXNG Configuration](SEARXNG_GUIDE.md)
4. **🔒 Secure**: [SSL Certificate Upgrade](SSL_GUIDE.md)

## 📞 **Getting Help**

- 🚀 **Interactive Management**: `./manage` (explore all options)
- 🔍 **Quick Diagnostics**: `./manage diagnose`
- 📋 **View Logs**: `./manage logs`
- ℹ️ **Access Information**: `./manage info`

---

**🎉 Congratulations!** Your Privacy Hub is now protecting your entire network with ad-blocking and private search!