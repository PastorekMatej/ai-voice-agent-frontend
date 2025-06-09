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

## ☁️ Google Cloud Deployment

This section covers the complete deployment process for Google Cloud Platform using Cloud Run, Artifact Registry, and Cloud Build.

### 🏗️ Google Cloud Configuration & Files

#### Required Files for Google Cloud Adaptation

The following files have been configured for Google Cloud deployment:

1. **`Dockerfile`** - Multi-stage build with Cloud Run optimizations
   - Accepts `REACT_APP_API_URL` build argument for backend connectivity
   - Configures Nginx for Cloud Run's container port requirements
   - Includes health checks for Cloud Run service monitoring

2. **`cloudbuild.yaml`** - Cloud Build configuration for automated CI/CD
   - Builds Docker image with proper environment variables
   - Pushes to Google Artifact Registry
   - Deploys to Cloud Run with appropriate settings

3. **`nginx.conf`** - Production-ready Nginx configuration
   - Optimized for Cloud Run environment
   - Includes health endpoint at `/health`
   - Configured for React SPA routing

4. **`.dockerignore`** - Optimizes build context for Cloud Build
   - Excludes unnecessary files to speed up builds
   - Reduces image size and build time

#### Environment Variables Configuration

```bash
# Required for Google Cloud deployment
REACT_APP_API_URL=https://ai-voice-backend-446760904661.us-central1.run.app
REACT_APP_ENABLE_ANALYTICS=true
GENERATE_SOURCEMAP=false
```

### 🛠️ Prerequisites

Before deploying to Google Cloud, ensure you have:

```bash
# 1. Google Cloud CLI installed and authenticated
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Enable required APIs
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Create Artifact Registry repository
gcloud artifacts repositories create ai-voice-agent \
    --repository-format=docker \
    --location=us-central1 \
    --description="AI Voice Agent containers"

# 4. Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 🚀 Key Google Cloud Deployment Commands

#### Method 1: Manual Docker Build & Deploy

```bash
# 1. Build with correct backend URL
docker build \
    --build-arg REACT_APP_API_URL=https://ai-voice-backend-446760904661.us-central1.run.app \
    -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-voice-agent/frontend:latest .

# 2. Push to Artifact Registry
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-voice-agent/frontend:latest

# 3. Deploy to Cloud Run
gcloud run deploy ai-voice-frontend \
    --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ai-voice-agent/frontend:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 80 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0
```

#### Method 2: Cloud Build (Recommended)

```bash
# Deploy using Cloud Build configuration
gcloud builds submit --config cloudbuild.yaml .

# Or with specific substitutions
gcloud builds submit \
    --config cloudbuild.yaml \
    --substitutions=_BACKEND_URL=https://ai-voice-backend-446760904661.us-central1.run.app \
    .
```

#### Method 3: Continuous Deployment

```bash
# Connect repository for automated builds
gcloud builds triggers create github \
    --repo-name=ai-voice-agent-frontend \
    --repo-owner=YOUR_GITHUB_USERNAME \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml
```

### 🔧 Advanced Cloud Run Configuration

#### Update Service Configuration
```bash
# Update environment variables
gcloud run services update ai-voice-frontend \
    --region us-central1 \
    --set-env-vars REACT_APP_API_URL=https://new-backend-url

# Update scaling settings
gcloud run services update ai-voice-frontend \
    --region us-central1 \
    --min-instances 1 \
    --max-instances 100 \
    --concurrency 80

# Update resource allocation
gcloud run services update ai-voice-frontend \
    --region us-central1 \
    --memory 1Gi \
    --cpu 1
```

#### Custom Domain Configuration
```bash
# Map custom domain
gcloud run domain-mappings create \
    --service ai-voice-frontend \
    --domain your-domain.com \
    --region us-central1

# Verify domain mapping
gcloud run domain-mappings list --region us-central1
```

### 📊 Monitoring & Management Commands

#### Service Management
```bash
# Get service details
gcloud run services describe ai-voice-frontend --region us-central1

# List all services
gcloud run services list

# Get service URL
gcloud run services describe ai-voice-frontend \
    --region us-central1 \
    --format="value(status.url)"
```

#### Logs & Debugging
```bash
# View service logs
gcloud run services logs read ai-voice-frontend --region us-central1

# Follow logs in real-time
gcloud run services logs tail ai-voice-frontend --region us-central1

# View Cloud Build logs
gcloud builds list --limit=10
gcloud builds log BUILD_ID
```

#### Traffic Management
```bash
# Split traffic between revisions
gcloud run services update-traffic ai-voice-frontend \
    --to-revisions ai-voice-frontend-00001=50,ai-voice-frontend-00002=50 \
    --region us-central1

# Route all traffic to latest revision
gcloud run services update-traffic ai-voice-frontend \
    --to-latest \
    --region us-central1
```

### 🔐 Security & IAM Configuration

#### Service Account Setup
```bash
# Create service account for Cloud Run
gcloud iam service-accounts create ai-voice-frontend-sa \
    --display-name="AI Voice Frontend Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-voice-frontend-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"
```

#### Network Security
```bash
# Restrict ingress to authenticated users only
gcloud run services update ai-voice-frontend \
    --region us-central1 \
    --ingress internal-and-cloud-load-balancing

# Configure VPC connector (if needed)
gcloud run services update ai-voice-frontend \
    --region us-central1 \
    --vpc-connector YOUR_VPC_CONNECTOR
```

### 🚨 Troubleshooting Google Cloud Deployment

#### Common Issues & Solutions

**Build failures:**
```bash
# Check Cloud Build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID

# Test build locally
docker build -t test-build .
```

**Service won't start:**
```bash
# Check service logs
gcloud run services logs read ai-voice-frontend --region us-central1

# Verify container health
curl https://ai-voice-frontend-446760904661.us-central1.run.app/health
```

**API connectivity issues:**
```bash
# Verify environment variables
gcloud run services describe ai-voice-frontend \
    --region us-central1 \
    --format="value(spec.template.spec.template.spec.containers[0].env[].value)"

# Test backend connectivity
curl https://ai-voice-backend-446760904661.us-central1.run.app/health
```

### 💰 Cost Optimization

```bash
# Set request timeout to reduce costs
gcloud run services update ai-voice-frontend \
    --region us-central1 \
    --timeout 300

# Configure minimum instances (0 for cost optimization)
gcloud run services update ai-voice-frontend \
    --region us-central1 \
    --min-instances 0

# Monitor usage and costs
gcloud run services describe ai-voice-frontend \
    --region us-central1 \
    --format="table(status.traffic[].latestRevision,status.traffic[].percent)"
```

### 🔄 Rollback & Version Management

```bash
# List all revisions
gcloud run revisions list --service ai-voice-frontend --region us-central1

# Rollback to previous revision
gcloud run services update-traffic ai-voice-frontend \
    --to-revisions ai-voice-frontend-00001=100 \
    --region us-central1

# Delete old revisions
gcloud run revisions delete REVISION_NAME --region us-central1
```

### 🌐 Production Deployment Checklist

- [ ] Backend service deployed and healthy
- [ ] Artifact Registry repository created
- [ ] Docker authentication configured
- [ ] Environment variables set correctly
- [ ] Cloud Build configuration tested
- [ ] Service deployed with appropriate resource limits
- [ ] Health checks passing
- [ ] Custom domain configured (optional)
- [ ] SSL certificate provisioned
- [ ] Monitoring and alerting configured
- [ ] IAM permissions properly configured

### 📚 Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Container Optimization Best Practices](https://cloud.google.com/run/docs/tips/general)

---

### 🚀 Other Cloud Platforms

#### AWS ECS / Fargate
```bash
# Tag for AWS ECR
docker tag ai-voice-frontend:latest <account>.dkr.ecr.region.amazonaws.com/ai-voice-frontend:latest

# Push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin <account>.dkr.ecr.region.amazonaws.com
docker push <account>.dkr.ecr.region.amazonaws.com/ai-voice-frontend:latest
```

#### Azure Container Instances
```bash
# Tag for Azure ACR
docker tag ai-voice-frontend:latest <registry>.azurecr.io/ai-voice-frontend:latest

# Push to ACR
az acr login --name <registry>
docker push <registry>.azurecr.io/ai-voice-frontend:latest
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
