# Development Setup

## How to Run in Development

### 1. Start Backend Services
```bash
docker compose -f docker-compose.windows.yml up -d
```

### 2. Start React Dev Server (separately)
```bash
cd frontend
npm install
npm run dev
```

This starts the React dev server on `http://localhost:3000`

### 3. Access Through Nginx
- Dashboard: `https://localhost/dashboard` (proxied to React dev server)
- Alternative: `https://localhost/home` (same as dashboard)
- Pi-hole: `https://localhost/admin`
- Search: `https://localhost/`

## How to Build for Production 

### 1. Build Static Files
```bash
cd frontend
npm run build
```

### 2. Copy Built Files to Nginx (Pi compose automates this)
```bash
mkdir -p nginx/html
cp -r frontend/dist/* nginx/html/
```

### 3. Update Nginx Config for Production
Change `nginx.prod.conf` to serve static files instead of proxying (already configured):

```nginx
location /dashboard {
    alias /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

## Why This Works Better

- **Development**: Real hot reload, no container complexity
- **Production**: Static files, no extra containers
- **Simple**: No broken container networking issues