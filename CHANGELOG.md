# Changelog

All notable changes to the Privacy Hub project will be documented in this file.

## [2.0.0] - 2024-12-28

### 🎉 Major Restructuring - Modular Architecture

#### Added
- **Interactive Management Interface**: New `./manage` script with intuitive menu system
- **Professional Script Structure**: 
  - Main scripts in root: `configure`, `setup`, `manage`
  - Modular helpers in `scripts/` directory
  - Organized into `core/`, `services/`, and `utils/` modules
- **Enhanced User Experience**:
  - Color-coded output with emojis for better readability
  - Interactive menus with numbered options
  - Progress indicators and status feedback
  - User-friendly prompts with defaults
- **Comprehensive Service Management**:
  - Individual service control (NGINX, Pi-hole, SearXNG)
  - Real-time status monitoring
  - Advanced logging and diagnostics
  - SSL certificate management
- **Security Enhancements**:
  - Auto-generated secure passwords (12 characters)
  - Auto-generated SearXNG secret keys (64 characters)
  - Trusted certificate support with mkcert
  - Password reset functionality
- **Network Diagnostics**:
  - Comprehensive connectivity testing
  - DNS resolution validation
  - Web interface accessibility checks
  - Automatic issue detection and repair

#### Changed
- **Script Architecture**: Complete restructuring for maintainability
  - `scripts/configure.sh` → `./configure`
  - `scripts/setup.sh` → `./setup` 
  - `scripts/manage.sh` → `./manage`
- **Documentation Focus**: Updated to emphasize "Local Network Privacy Solution"
- **Installation Process**: Streamlined 3-step process (configure, setup, manage)
- **Password Management**: Pi-hole password now properly set during deployment
- **SSL Workflow**: Improved certificate generation and upgrade path

#### Removed
- Old monolithic scripts
- Manual password prompts (now auto-generated)
- Hardcoded configuration values
- Redundant diagnostic scripts

#### Fixed
- **Critical**: Pi-hole admin password now correctly applied during container startup
- **NGINX Routing**: Proper API routing for both Pi-hole and SearXNG
- **SSL Certificates**: Reliable certificate generation and deployment
- **Container Networking**: Improved internal service communication
- **Environment Variables**: Proper YAML processing for SearXNG configuration

### Technical Improvements

#### Modular Architecture
```
privacy-hub/
├── configure         # Interactive configuration
├── setup            # Automated deployment  
├── manage           # Interactive management
└── scripts/
    ├── utils/       # Common utilities (colors, prompts, validation)
    ├── core/        # Core functionality (env, docker, network, ssl)
    └── services/    # Service-specific operations (pihole, searxng, nginx)
```

#### Enhanced Management Features
- **Interactive Menus**: Navigate complex operations easily
- **Backwards Compatibility**: CLI commands still work (`./manage status`, etc.)
- **Comprehensive Diagnostics**: Network, SSL, service health monitoring
- **Resource Management**: Docker cleanup, backups, system info
- **Troubleshooting**: Built-in diagnostic and repair workflows

## [1.0.0] - 2024-12-27

### Initial Release
- Basic Docker Compose setup for Pi-hole, SearXNG, and NGINX
- SSL certificate generation
- Environment configuration
- Core networking setup

### Components
- **Pi-hole**: DNS sinkhole for ad blocking
- **SearXNG**: Privacy-focused metasearch engine  
- **NGINX**: Reverse proxy with SSL termination
- **Docker Compose**: Container orchestration

---

## Migration Notes

### From v1.0.0 to v2.0.0

**No action required** - your existing `.env` file and Docker containers will continue working.

**To use new features**:
1. Run `./manage` for the new interactive interface
2. Use `./manage ssl` to upgrade to trusted certificates
3. Explore service-specific management options

**Script Changes**:
- Old: `./scripts/manage.sh status` → New: `./manage status`
- Old: `./scripts/setup.sh` → New: `./setup`
- Old: `./scripts/configure.sh` → New: `./configure`

All new functionality is backward compatible with existing deployments.