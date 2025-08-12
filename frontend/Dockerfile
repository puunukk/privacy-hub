# Simple build and serve
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./  
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vite.config.ts ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY index.html ./

# Ensure Tailwind can scan all files properly
ENV NODE_ENV=production

# Build the app with verbose output for debugging
RUN npm run build

# Install a simple HTTP server
RUN npm install -g serve

EXPOSE 3000

# Serve the built app on port 3000 for consistency
CMD ["serve", "-s", "dist", "-l", "3000"]