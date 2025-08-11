# Private Hub Frontend

TypeScript React dashboard for Docker container management with ViteJS and Tailwind CSS.

## Features

- **Fully TypeScript** - Strict typing with latest TypeScript 5.6.3
- **Modern React 18.3** - Functional components with hooks
- **Vite 5.4** - Fast development and optimized builds
- **Tailwind CSS 3.4** - Utility-first styling (properly configured, not CDN)
- **Component Architecture** - Reusable, well-structured components
- **Docker Management** - Start/stop/restart/remove containers
- **Real-time Updates** - Auto-refresh every 30 seconds
- **Security** - Uses docker-socket-proxy for safe Docker API access

## Development

```bash
# Install dependencies
cd frontend
npm install

# Start development server (with hot reload)
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

## Architecture

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks  
├── types/         # TypeScript interfaces
├── utils/         # Utility functions
├── App.tsx        # Main app component (now clean!)
└── main.tsx       # React entry point
```

## Docker Setup

- **Development**: Volume mounted for hot reload
- **Production**: Multi-stage build with static files served by nginx