# ==============================================================================
# FoodExpress Production Dockerfile
# Multi-stage build for optimal security, minimal size, and high performance
# ==============================================================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production Final Image
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install curl for Docker health checks
RUN apk add --no-cache curl

# Create and switch to non-root user 'node' (built-in in official alpine images)
USER node

# Copy production node_modules from dependencies stage with correct permissions
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node server.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public

# Expose application port
EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the Node.js application
CMD ["node", "server.js"]
