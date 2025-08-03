# 🏗️ Network Architecture Deep Dive

## 🎯 **Privacy Hub Network Flow**

Privacy Hub transforms your Raspberry Pi into a comprehensive privacy gateway. Here's exactly how traffic flows through the system:

### 📊 **Complete Network Diagram**

```mermaid
graph TD
    A["🏠 Your Devices<br/>(Phone, Laptop, Smart TV)"] --> B["📡 Router<br/>(DHCP + DNS Config)"]
    B --> C["🥧 Raspberry Pi<br/>(Privacy Hub Gateway)"]
    C --> D["🌐 Internet"]
    
    subgraph "🔒 Privacy Hub Internal"
        E["⚡ NGINX Reverse Proxy<br/>Port 53 (DNS)<br/>Port 80 (HTTP)<br/>Port 443 (HTTPS)"]
        F["🛡️ Pi-hole Container<br/>Port 80 (Internal)<br/>DNS Server + Web Admin"]
        G["🔍 SearXNG Container<br/>Port 8080 (Internal)<br/>Private Search Engine"]
    end
    
    C --> E
    E -->|"DNS Queries<br/>(Port 53)"| F
    E -->|"Web Admin<br/>(/admin)"| F
    E -->|"Search Requests<br/>(/)"| G
    
    F -->|"Allowed DNS<br/>Queries"| D
    G -->|"Search<br/>Requests"| D
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#e3f2fd
    style G fill:#f1f8e9
```

## 🔄 **Traffic Flow Breakdown**

### 1. 🌐 **DNS Resolution Flow** (Ad Blocking)

```mermaid
sequenceDiagram
    participant Device as 📱 Device
    participant Router as 📡 Router
    participant Pi as 🥧 Raspberry Pi
    participant NGINX as ⚡ NGINX
    participant PiHole as 🛡️ Pi-hole
    participant Internet as 🌐 Internet
    
    Device->>Router: "What's the IP for google.com?"
    Router->>Pi: Forward DNS query to Pi IP:53
    Pi->>NGINX: Receive on port 53
    NGINX->>PiHole: Forward to Pi-hole container
    
    alt Domain is blocked (ads/trackers)
        PiHole->>NGINX: Return 0.0.0.0 (blocked)
        NGINX->>Pi: Blocked response
        Pi->>Router: "Domain blocked"
        Router->>Device: "No access" ❌
    else Domain is allowed
        PiHole->>Internet: Query legitimate DNS
        Internet->>PiHole: Return real IP
        PiHole->>NGINX: Forward real IP
        NGINX->>Pi: Real IP response
        Pi->>Router: Real IP address
        Router->>Device: "Connect to real IP" ✅
    end
```

### 2. 🔍 **Web Traffic Flow** (Private Search & Admin)

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Browser as 🌐 Browser
    participant Pi as 🥧 Raspberry Pi
    participant NGINX as ⚡ NGINX
    participant PiHole as 🛡️ Pi-hole
    participant SearXNG as 🔍 SearXNG
    
    User->>Browser: Visit https://pi-ip/
    Browser->>Pi: HTTPS request port 443
    Pi->>NGINX: Receive web request
    
    alt Request to /admin
        NGINX->>PiHole: Forward to Pi-hole admin
        PiHole->>NGINX: Pi-hole admin interface
        NGINX->>Pi: Admin page response
        Pi->>Browser: Pi-hole Admin Panel 🛡️
    else Request to / (root)
        NGINX->>SearXNG: Forward to SearXNG
        SearXNG->>NGINX: Private search interface
        NGINX->>Pi: Search page response
        Pi->>Browser: Private Search Engine 🔍
    end
```

## 🔧 **Port Mapping & Security**

### **External Ports (Raspberry Pi)**
| Port | Service | Purpose | Access |
|------|---------|---------|---------|
| `53` | DNS | Pi-hole DNS resolution | All devices via router |
| `80` | HTTP | Redirects to HTTPS | Web browsers |
| `443` | HTTPS | Secure web access | Web browsers |

### **Internal Docker Network**
| Container | Internal Port | Purpose | External Access |
|-----------|---------------|---------|-----------------|
| **Pi-hole** | `80` | DNS + Web Admin | Via NGINX `/admin` |
| **SearXNG** | `8080` | Private Search | Via NGINX `/` |
| **NGINX** | `53,80,443` | Reverse Proxy | Direct from Pi |

### 🛡️ **Security Architecture**

```mermaid
graph LR
    subgraph "🌐 External Network"
        A[Internet]
        B[Router]
        C[Devices]
    end
    
    subgraph "🔒 Raspberry Pi (DMZ)"
        D[NGINX - Only Exposed Service]
    end
    
    subgraph "🐳 Internal Docker Network"
        E[Pi-hole Container]
        F[SearXNG Container]
    end
    
    A <--> B
    B <--> C
    B <--> D
    D <--> E
    D <--> F
    
    style D fill:#ffcccc
    style E fill:#ccffcc
    style F fill:#ccccff
```

**Security Benefits:**
- ✅ **Single Entry Point**: Only NGINX exposed to network
- ✅ **Container Isolation**: Pi-hole & SearXNG not directly accessible
- ✅ **HTTPS Everywhere**: All web traffic encrypted
- ✅ **Minimal Attack Surface**: Professional reverse proxy architecture

## 📝 **Router Configuration Explained**

### **Why Set Router DNS to Pi IP?**

When you configure your router's DNS to point to your Raspberry Pi's IP address:

1. **All devices automatically inherit this setting** via DHCP
2. **Every DNS query** goes through Pi-hole for filtering
3. **No per-device configuration** needed
4. **Instant network-wide protection** for all connected devices

### **Configuration Steps:**

```mermaid
graph TD
    A["1. 🔧 Access Router Admin<br/>(Usually 192.168.1.1)"] --> B["2. 📍 Set DHCP Reservation<br/>(Pi MAC → Static IP)"]
    B --> C["3. 🌐 Set DNS Server<br/>(Primary: Pi IP)"]
    C --> D["4. 💾 Save & Restart Router"]
    D --> E["5. ✅ All Devices Protected<br/>(Automatic via DHCP)"]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#e1f5fe
```

## 🔗 **Quick Access Links**

### **Pi-hole Management**
- 📊 **Dashboard**: `https://your-pi-ip/admin`
- 🚫 **Blocklist Management**: `https://your-pi-ip/admin/groups-adlists.php`
- 📈 **Query Log**: `https://your-pi-ip/admin/queries.php`
- ⚙️ **Settings**: `https://your-pi-ip/admin/settings.php`
- 🔄 **Disable/Enable**: `https://your-pi-ip/admin/api.php`

### **SearXNG Customization**
- 🔍 **Search Interface**: `https://your-pi-ip/`
- ⚙️ **Preferences**: `https://your-pi-ip/preferences`
- 🎨 **Themes**: `https://your-pi-ip/preferences#ui`
- 🔒 **Safe Search**: `https://your-pi-ip/preferences#general`

## 📚 **External Documentation**

### **Pi-hole Resources**
- [Official Pi-hole Documentation](https://docs.pi-hole.net/)
- [Blocklist Collections](https://firebog.net/)
- [Pi-hole API Documentation](https://discourse.pi-hole.net/t/pi-hole-api/1863)
- [Custom DNS Records](https://docs.pi-hole.net/guides/dns/unbound/)

### **SearXNG Resources**
- [SearXNG Documentation](https://docs.searxng.org/)
- [Search Engine Configuration](https://docs.searxng.org/admin/engines.html)
- [Custom Themes](https://docs.searxng.org/dev/makefile.html#themes)
- [Instance Settings](https://docs.searxng.org/admin/settings.html)

### **NGINX Resources**  
- [NGINX Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [SSL/TLS Configuration](https://ssl-config.mozilla.org/)
- [Security Headers](https://securityheaders.com/)

## 🎯 **Network Troubleshooting**

### **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| 🔴 **DNS not working** | Sites won't load | Check router DNS setting |
| 🟡 **Some ads showing** | Ads slip through | Update Pi-hole blocklists |
| 🔴 **Can't access admin** | 404/503 errors | Check NGINX routing |
| 🟡 **Search not working** | SearXNG errors | Restart SearXNG container |
| 🔴 **SSL warnings** | Certificate errors | Upgrade to trusted certificates |

### **Diagnostic Commands**
```bash
# Quick status check
./manage status

# Full network diagnostics  
./manage diagnose

# Test specific services
./manage logs nginx
./manage logs pihole
./manage logs searxng
```

---

**💡 Pro Tip**: Use `./manage` interactive menu to explore all network management options without memorizing commands!