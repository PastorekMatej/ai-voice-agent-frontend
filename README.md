# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.







## 🐳 Docker Implementation

This frontend is fully containerized using Docker with production-ready optimizations. The implementation uses a multi-stage build process for optimal performance and security.

### 🏗️ Architecture Overview

- **Multi-stage Docker build**: Separate build and production stages
- **Node.js 18 Alpine**: Lightweight build environment
- **Nginx Alpine**: Production web server
- **Optimized asset serving**: Gzip compression, caching headers, security headers
- **Health checks**: Container monitoring and orchestration support
- **Environment configuration**: Flexible deployment across different environments

### 📦 Docker Files Structure

```
frontend/
├── Dockerfile              # Multi-stage build configuration
├── nginx.conf              # Production nginx configuration  
├── .dockerignore           # Build context optimization
├── docker-compose.yml      # Local development environment
├── docker-compose.prod.yml # Production environment
├── .env.example            # Environment variables template
├── .env.development        # Development configuration
└── .env.production         # Production configuration
```

### 🚀 Quick Start

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Port 3000 available (or modify port mapping)

#### Build and Run
```bash
# Build the Docker image
docker build -t ai-voice-frontend:latest .

# Run the container
docker run -p 3000:80 ai-voice-frontend:latest

# Access the application
# Open http://localhost:3000 in your browser
```

### 🛠️ Development Workflow

#### Local Development with Docker
```bash
# Run with development environment
npm run docker:dev

# Or manually:
docker-compose up --build

# Run in background
docker-compose up -d --build
```

#### Production Testing
```bash
# Test production build locally
npm run docker:prod

# Or manually:
docker-compose -f docker-compose.prod.yml up --build
```

### 🔧 Useful Docker Commands

#### Container Management
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop container
docker stop <container-id-or-name>

# Remove container
docker rm <container-id-or-name>

# Stop and remove all containers
docker stop $(docker ps -q) && docker rm $(docker ps -aq)
```

#### Image Management
```bash
# List Docker images
docker images

# Remove image
docker rmi ai-voice-frontend:latest

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune -a
```

#### Debugging and Logs
```bash
# View container logs
docker logs <container-id-or-name>

# Follow logs in real-time
docker logs -f <container-id-or-name>

# Execute command in running container
docker exec -it <container-id-or-name> sh

# Inspect container configuration
docker inspect <container-id-or-name>

# Check container resource usage
docker stats <container-id-or-name>
```

#### Health and Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test static assets
curl -I http://localhost:3000/static/js/main.<hash>.js
curl -I http://localhost:3000/static/css/main.<hash>.css

# Test main application
curl -I http://localhost:3000/
```

### 🌍 Environment Configuration

#### Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5001

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false

# Build Configuration
GENERATE_SOURCEMAP=false
```

#### Development vs Production
```bash
# Development (with hot reload, debugging)
REACT_APP_API_URL=http://localhost:5001
REACT_APP_ENABLE_ANALYTICS=false
GENERATE_SOURCEMAP=true

# Production (optimized, analytics enabled)
REACT_APP_API_URL=https://your-backend-api.cloudrun.app
REACT_APP_ENABLE_ANALYTICS=true
GENERATE_SOURCEMAP=false
```

### 🔄 CI/CD Integration

#### NPM Scripts for Docker
```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run

# Development environment
npm run docker:dev

# Production environment
npm run docker:prod
```

#### Docker Compose Services
```bash
# Start all services (frontend + backend)
docker-compose up

# Start specific service
docker-compose up frontend

# Rebuild and start
docker-compose up --build

# Scale services
docker-compose up --scale frontend=2
```

### 🚀 Cloud Deployment

#### Google Cloud Run
```bash
# Build and tag for GCR
docker build -t gcr.io/PROJECT_ID/ai-voice-frontend:latest .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/ai-voice-frontend:latest

# Deploy to Cloud Run
gcloud run deploy ai-voice-frontend \
  --image gcr.io/PROJECT_ID/ai-voice-frontend:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars REACT_APP_API_URL=https://backend-url
```

#### AWS ECS / Azure Container Instances
```bash
# Tag for AWS ECR
docker tag ai-voice-frontend:latest <account>.dkr.ecr.region.amazonaws.com/ai-voice-frontend:latest

# Tag for Azure ACR
docker tag ai-voice-frontend:latest <registry>.azurecr.io/ai-voice-frontend:latest
```

### 🐛 Troubleshooting

#### Common Issues

**Container won't start:**
```bash
# Check Docker Desktop is running
docker --version

# Check port availability
netstat -an | findstr :3000  # Windows
lsof -i :3000                # macOS/Linux
```

**Build failures:**
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t ai-voice-frontend:latest .

# Check .dockerignore excludes
cat .dockerignore
```

**Asset loading issues:**
```bash
# Verify build output
docker exec -it <container> ls -la /usr/share/nginx/html/static

# Check nginx configuration
docker exec -it <container> cat /etc/nginx/conf.d/default.conf

# Test asset paths
curl -I http://localhost:3000/static/js/main.<hash>.js
```

**API connection issues:**
```bash
# Check environment variables
docker exec -it <container> env | grep REACT_APP

# Test API connectivity (if backend in Docker)
docker exec -it <container> curl http://backend:5001/health
```

#### Performance Optimization

**Build optimization:**
```bash
# Use .dockerignore to exclude unnecessary files
echo "node_modules\n.git\nbuild\ncoverage" >> .dockerignore

# Multi-stage builds reduce final image size
# Build stage: ~800MB → Production stage: ~25MB
```

**Runtime optimization:**
```bash
# Enable gzip compression (already configured)
# Static asset caching (already configured)
# Security headers (already configured)

# Monitor container resources
docker stats <container-name>
```

### 📊 Monitoring and Health Checks

#### Built-in Health Monitoring
```bash
# Docker health check (automatic)
docker ps  # Shows (healthy) status

# Manual health verification
curl http://localhost:3000/health
# Expected response: "healthy"
```

#### Container Metrics
```bash
# Resource usage
docker stats --no-stream <container-name>

# Container processes
docker exec -it <container-name> ps aux

# Network connections
docker port <container-name>
```

### 🔐 Security Considerations

- **Non-root user**: Nginx runs as non-root in container
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Minimal attack surface**: Alpine Linux base images
- **No sensitive data**: Build-time secrets not persisted in image layers
- **Environment separation**: Different configs for dev/staging/prod

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
