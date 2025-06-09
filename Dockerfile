# DOCKER IMPLEMENTATION: Multi-stage build for React frontend

# Build stage
FROM node:18-alpine as build

# DOCKER IMPLEMENTATION: Set working directory inside container
WORKDIR /app

# DOCKER IMPLEMENTATION: Accept build arguments
ARG REACT_APP_API_URL=https://ai-voice-backend-446760904661.us-central1.run.app
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# DOCKER IMPLEMENTATION: Copy package files first for better Docker layer caching
COPY package*.json ./

# DOCKER IMPLEMENTATION: Install ALL dependencies (including devDependencies for build)
RUN npm install

# DOCKER IMPLEMENTATION: Copy source code to container
COPY . .

# DOCKER IMPLEMENTATION: Build the React app for production
RUN npm run build

# Production stage
FROM nginx:1.21-alpine

# DOCKER IMPLEMENTATION: Copy built React app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# DOCKER IMPLEMENTATION: Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# DOCKER IMPLEMENTATION: Add our nginx config
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    location /health {
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
}
EOF

# DOCKER IMPLEMENTATION: Expose port 80 for web server
EXPOSE 80

# DOCKER IMPLEMENTATION: Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# DOCKER IMPLEMENTATION: Start nginx web server
CMD ["nginx", "-g", "daemon off;"]