# ============================================================
#  TN Scheme Bot – Multi-Stage Dockerfile
#
#  Stage 1 (builder): Install client deps + build React app
#  Stage 2 (runner) : Install server deps + run Express
# ============================================================

# ── Stage 1: Build React Frontend ───────────────────────────
FROM node:20-alpine AS builder

LABEL stage="builder"

WORKDIR /build

# Copy client package files first (layer cache optimization)
COPY client/package*.json ./client/

# Install client dependencies
RUN cd client && npm ci --prefer-offline

# Copy the rest of the client source
COPY client/ ./client/

# Copy data folder (needed if the build references it)
# Build outputs to client/../public = /build/public
RUN cd client && npm run build

# ── Stage 2: Production Runner ───────────────────────────────
FROM node:20-alpine AS runner

LABEL maintainer="TN Scheme Bot"
LABEL description="Tamil Nadu Government Scheme Chatbot"

WORKDIR /app

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Copy server package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --prefer-offline

# Copy server source files
COPY server.js         ./
COPY routes/           ./routes/
COPY models/           ./models/
COPY middleware/       ./middleware/
COPY scripts/          ./scripts/
COPY data/             ./data/

# Copy the built React app from builder stage into public/
COPY --from=builder /build/public ./public/

# Create a non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Expose the Express server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

# Use dumb-init as PID 1 to handle signals correctly
ENTRYPOINT ["dumb-init", "--"]

# Start the Express server
CMD ["node", "server.js"]
