# =============================================================================
# RentLink Frontend Web Application Dockerfile
# Multi-stage production build: Node.js Vite Build -> Nginx Alpine Runner
# =============================================================================

# --- Stage 1: Build Application Bundle ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm ci || npm install

# Copy application source code
COPY . .

# Optional build arguments for dynamic API routing
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build optimized production bundle to /app/dist
RUN npm run build

# --- Stage 2: Serve with High-Performance Nginx ---
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
