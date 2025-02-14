# Use the official Bun image
FROM oven/bun:latest

# Set working directory inside the container
WORKDIR /app

# Install PM2 globally
RUN bun add -g pm2

# Copy only package and lock files first (for caching)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install || bun install --no-lockfile

# Copy the rest of the application (excluding node_modules & .bun via .dockerignore)
COPY . .

# Ensure PM2 config is available
COPY pm2.config.js .

# Expose the port
EXPOSE 6767

# Set environment variables
ENV PORT=6767

# Start the app using PM2
CMD ["pm2-runtime", "start", "pm2.config.js"]
