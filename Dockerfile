# DOCKER IMPLEMENTATION: Multi-stage build for React frontend

# Build stage
FROM node:18-alpine as build

# DOCKER IMPLEMENTATION: Set working directory inside container
WORKDIR /app

# DOCKER IMPLEMENTATION: Copy package files first for better Docker layer caching
COPY package*.json ./

# DOCKER IMPLEMENTATION: Install dependencies in container
RUN npm ci --only=production

# DOCKER IMPLEMENTATION: Copy source code to container
COPY . .

# DOCKER IMPLEMENTATION: Build the React app for production
RUN npm run build

# Production stage
FROM nginx:alpine

# DOCKER IMPLEMENTATION: Copy built React app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# DOCKER IMPLEMENTATION: Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# DOCKER IMPLEMENTATION: Expose port 80 for web server
EXPOSE 80

# DOCKER IMPLEMENTATION: Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# DOCKER IMPLEMENTATION: Start nginx web server
CMD ["nginx", "-g", "daemon off;"]
