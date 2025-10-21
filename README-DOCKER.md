# CodeBros Backend - Docker Setup

Simple Docker setup for the CodeBros backend with multi-language code execution.

## Quick Start

1. **Deploy with one command:**

   ```cmd
   npm run docker:deploy
   ```

2. **That's it!** Your API will be running at `http://localhost:5000`

## What it includes

- **Node.js 18** - Main backend
- **Python 3** - For Python code execution  
- **Java 11** - For Java code execution
- **C++** - For C++ code execution
- **PostgreSQL** - Your database (already configured)

## Available Scripts

```cmd
npm run docker:deploy    # Setup, build and start (one command)
npm run docker:setup     # Copy environment file
npm run docker:build     # Build Docker image
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View logs
```

## Files

- `Dockerfile` - Simple container setup
- `docker-compose.yml` - Service configuration  
- `.env.docker` - Environment variables (already configured)

## Manual commands

```cmd
# Build and run manually
docker build -t codebros-backend .
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

That's it! No complex configuration needed.