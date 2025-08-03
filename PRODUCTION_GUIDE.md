# Production Deployment Guide

## 🎉 Your NestJS + React E-commerce App is Production Ready!

This guide covers the complete production deployment of your monorepo e-commerce application to Hetzner Cloud.

## ✅ What's Been Fixed and Configured

### 1. **Fixed Tailwind CSS v4+ Configuration**
- ✅ Migrated from JavaScript config to CSS-first configuration
- ✅ Updated to use `@theme` directive in CSS
- ✅ All utility classes now work correctly

### 2. **Docker Configuration**
- ✅ Multi-stage Dockerfile optimized for production
- ✅ Separate targets for development (`api-dev`, `web-dev`) and production (`api`, `web`)
- ✅ Production-optimized React build with Nginx serving
- ✅ Proper health checks and security configurations

### 3. **Docker Compose Setup**
- ✅ `docker-compose.dev.yml` - Development environment with hot reload
- ✅ `docker-compose.prod.yml` - Production environment with Traefik, SSL, and monitoring
- ✅ Complete service orchestration: PostgreSQL, Redis, API, Web, Traefik, Grafana, Prometheus

### 4. **Production Infrastructure**
- ✅ Nginx configuration for production static file serving
- ✅ SSL/TLS with automatic certificate generation via Traefik
- ✅ Comprehensive monitoring with Grafana and Prometheus
- ✅ Automated backups and health monitoring

### 5. **Deployment Automation**
- ✅ Hetzner Cloud deployment script
- ✅ Server setup automation
- ✅ Production validation script
- ✅ Maintenance and monitoring cron jobs

## 🚀 Quick Start - Development

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# Check services
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Access your app
# Web: http://localhost:5173
# API: http://localhost:3000
```

## 🌍 Production Deployment

### Prerequisites
- Hetzner Cloud server (Ubuntu 20.04+ recommended)
- Domain name pointed to your server
- SSH access to your server

### Step 1: Configure Environment
1. Copy and update production environment:
```bash
cp .env.production .env.production.local
```

2. Update these required variables in `.env.production`:
```bash
HETZNER_SERVER_IP=your.server.ip.address
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
```

### Step 2: Server Setup
Run this on your Hetzner server:
```bash
# On your server
curl -sSL https://raw.githubusercontent.com/yourusername/nestjs-reactjs-ecom-boilerplate/main/scripts/server_setup.sh | bash
```

Or manually:
```bash
# Copy and run the server setup script
scp scripts/server_setup.sh root@your.server.ip:/tmp/
ssh root@your.server.ip "bash /tmp/server_setup.sh"
```

### Step 3: Validate Production Readiness
```bash
# Run comprehensive validation
bash scripts/validate_production.sh
```

### Step 4: Deploy to Production
```bash
# Deploy your application
bash scripts/deploy_to_hetzner.sh
```

## 📊 Monitoring and Management

### Available Endpoints
- **Frontend**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **API Health**: https://api.yourdomain.com/health
- **Grafana**: https://grafana.yourdomain.com
- **Prometheus**: https://prometheus.yourdomain.com

### Useful Commands

#### Check Application Status
```bash
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose ps"
```

#### View Logs
```bash
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose logs -f"
```

#### Restart Services
```bash
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose restart"
```

#### Manual Backup
```bash
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose exec -T db bash /backup.sh"
```

## 🔧 Production Architecture

```
Internet → Traefik (SSL/Load Balancer) → Services
                    ↓
            ┌─────────────────┐
            │   Nginx (Web)   │ → React Frontend
            └─────────────────┘
                    ↓
            ┌─────────────────┐
            │  NestJS API     │ → Business Logic
            └─────────────────┘
                    ↓
    ┌─────────────────┐  ┌─────────────────┐
    │   PostgreSQL    │  │      Redis      │
    │   (Database)    │  │     (Cache)     │
    └─────────────────┘  └─────────────────┘
                    ↓
            ┌─────────────────┐
            │   Monitoring    │ → Grafana + Prometheus
            └─────────────────┘
```

## 🛡️ Security Features

- ✅ **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- ✅ **Security Headers**: Comprehensive Nginx security configuration
- ✅ **CORS**: Properly configured for production
- ✅ **JWT**: Secure authentication with refresh tokens
- ✅ **Rate Limiting**: Built into API endpoints
- ✅ **Firewall**: UFW configured on server
- ✅ **Fail2Ban**: Intrusion detection and prevention

## 📈 Performance Optimizations

- ✅ **Gzip Compression**: Enabled in Nginx
- ✅ **Static File Caching**: Optimized cache headers
- ✅ **Database Connection Pooling**: Configured in Prisma
- ✅ **Redis Caching**: Session and data caching
- ✅ **Docker Multi-stage Builds**: Minimal production images
- ✅ **Asset Optimization**: Vite production builds

## 🔄 CI/CD Ready

The application is configured for easy CI/CD integration:

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Hetzner
        run: |
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > key.pem
          chmod 600 key.pem
          bash scripts/deploy_to_hetzner.sh
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### SSL Certificate Issues
```bash
# Check Traefik logs
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose logs traefik"

# Restart Traefik
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose restart traefik"
```

#### Database Connection Issues
```bash
# Check database logs
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose logs db"

# Restart database
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose restart db"
```

#### API Not Responding
```bash
# Check API logs
ssh root@your.server.ip "cd /opt/nestjs-reactjs-ecom-boilerplate && docker compose logs api"

# Check API health
curl -f https://api.yourdomain.com/health
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Hetzner Cloud Documentation](https://docs.hetzner.com/cloud/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)

## 🎯 Next Steps

1. **Custom Domain Setup**: Point your domain to the server IP
2. **Email Configuration**: Set up SMTP for notifications
3. **Payment Integration**: Add Stripe or other payment providers
4. **Analytics**: Integrate Google Analytics or similar
5. **Backup Strategy**: Set up automated backups to cloud storage
6. **Scaling**: Consider load balancers for high traffic

---

## 🎉 Congratulations!

Your NestJS + React e-commerce application is now production-ready with:
- ✅ Modern tech stack (React 19, NestJS, Prisma, PostgreSQL, Redis)
- ✅ Production-grade infrastructure (Docker, Nginx, SSL, Monitoring)
- ✅ Automated deployment and maintenance
- ✅ Security best practices
- ✅ Performance optimizations
- ✅ Comprehensive monitoring and logging

Happy coding! 🚀
