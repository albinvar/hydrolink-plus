# ---- Build Stage ----
FROM oven/bun:alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package.json and lockfile first (to cache dependencies)
COPY package.json bun.lockb ./

# Install dependencies without unnecessary files
RUN bun install || bun install --no-lockfile

# Copy the rest of the application
COPY . .

# ---- Final Runtime Stage ----
FROM oven/bun:alpine AS runtime

# Set working directory
WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=builder /app /app

# Install PM2 globally (if not already included in build)
RUN bun add -g pm2

# Expose the port
EXPOSE 6767

# Set environment variables
ENV PORT=6767

# Start the app using PM2
CMD ["pm2-runtime", "start", "pm2.config.js"]
