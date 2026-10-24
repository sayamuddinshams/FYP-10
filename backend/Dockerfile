# =============================================================================
# RentLink Backend REST API Dockerfile
# Production-ready Node.js & MongoDB API service
# =============================================================================
FROM node:20-alpine AS runner

# Create application directory
WORKDIR /app

# Install security updates & dumb-init for proper signal handling (SIGTERM/SIGINT)
RUN apk --no-cache add dumb-init

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev

# Copy application source code
COPY src/ ./src/

# Use non-root node user for security
USER node

# Expose backend REST API port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start server using dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
