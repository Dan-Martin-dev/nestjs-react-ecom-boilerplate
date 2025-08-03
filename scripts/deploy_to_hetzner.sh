#!/bin/bash
# Deployment script for Hetzner Cloud
# This script deploys the monorepo ecommerce application to a Hetzner server

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - update these values
SSH_USER="root"
HETZNER_IP=$(grep HETZNER_SERVER_IP .env.production | cut -d '=' -f2 | tr -d '"')
DOMAIN=$(grep DOMAIN .env.production | cut -d '=' -f2 | tr -d '"')
DEPLOY_PATH="/opt/nestjs-reactjs-ecom-boilerplate"

echo -e "${BLUE}=== HETZNER CLOUD DEPLOYMENT ===${NC}"

# Validate environment configuration
if [ -z "$HETZNER_IP" ]; then
  echo -e "${RED}Error: HETZNER_SERVER_IP not found in .env.production${NC}"
  echo -e "${YELLOW}Please update the .env.production file with your server IP${NC}"
  exit 1
fi

if [ -z "$DOMAIN" ]; then
  echo -e "${RED}Error: DOMAIN not found in .env.production${NC}"
  echo -e "${YELLOW}Please update the .env.production file with your domain${NC}"
  exit 1
fi

echo -e "${GREEN}Deploying to: $HETZNER_IP${NC}"
echo -e "${GREEN}Domain: $DOMAIN${NC}"
echo ""

# Pre-deployment validation
echo -e "${YELLOW}Running pre-deployment validation...${NC}"
if ! bash scripts/validate_production.sh; then
    echo -e "${RED}Pre-deployment validation failed. Please fix issues before deploying.${NC}"
    exit 1
fi

# Check SSH connection
echo -e "${YELLOW}Checking SSH connection...${NC}"
if ! ssh -o StrictHostKeyChecking=no $SSH_USER@$HETZNER_IP "echo 'SSH connection successful'"; then
    echo -e "${RED}Failed to connect to server. Please check SSH configuration.${NC}"
    exit 1
fi

# Install Docker and Docker Compose if not already installed
echo -e "${YELLOW}Ensuring Docker and Docker Compose are installed...${NC}"
ssh $SSH_USER@$HETZNER_IP "which docker > /dev/null || \
  (apt-get update && apt-get install -y apt-transport-https ca-certificates curl software-properties-common && \
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
  add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" && \
  apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io)"

ssh $SSH_USER@$HETZNER_IP "which docker-compose > /dev/null || \
  (curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && \
  chmod +x /usr/local/bin/docker-compose)"

# Create deployment directory if it doesn't exist
echo -e "${YELLOW}Creating deployment directory...${NC}"
ssh $SSH_USER@$HETZNER_IP "mkdir -p $DEPLOY_PATH"

# Stop existing services gracefully
echo -e "${YELLOW}Stopping existing services...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose down --remove-orphans || echo 'No existing services to stop'"

# Create backup of current deployment
echo -e "${YELLOW}Creating backup of current deployment...${NC}"
ssh $SSH_USER@$HETZNER_IP "
if [ -d $DEPLOY_PATH/backup ]; then rm -rf $DEPLOY_PATH/backup; fi
mkdir -p $DEPLOY_PATH/backup
if [ -f $DEPLOY_PATH/.env ]; then cp $DEPLOY_PATH/.env $DEPLOY_PATH/backup/; fi
"

# Copy production files to server
echo -e "${YELLOW}Copying application files to server...${NC}"
scp docker-compose.prod.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/docker-compose.yml
scp .env.production $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/.env
scp nginx.conf $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/nginx.conf

# Copy scripts
echo -e "${YELLOW}Copying maintenance scripts...${NC}"
ssh $SSH_USER@$HETZNER_IP "mkdir -p $DEPLOY_PATH/scripts"
scp scripts/backup.sh $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/scripts/
scp scripts/health_check.sh $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/scripts/
scp scripts/setup_crontabs.sh $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/scripts/

# Copy monitoring configuration
echo -e "${YELLOW}Copying monitoring configuration...${NC}"
ssh $SSH_USER@$HETZNER_IP "mkdir -p $DEPLOY_PATH/monitoring/templates"
scp monitoring/prometheus.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/
scp monitoring/alertmanager.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/
scp monitoring/alerts.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/
scp monitoring/templates/* $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/templates/

# Make scripts executable
ssh $SSH_USER@$HETZNER_IP "chmod +x $DEPLOY_PATH/scripts/*.sh"

# Pull and build images
echo -e "${YELLOW}Building and starting services...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose pull"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose up -d --build"

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check if services are running
echo -e "${YELLOW}Verifying service health...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose ps"

# Health checks
echo -e "${YELLOW}Running health checks...${NC}"
if ssh $SSH_USER@$HETZNER_IP "curl -f http://localhost:3000/health > /dev/null 2>&1"; then
    echo -e "${GREEN}✓ API health check passed${NC}"
else
    echo -e "${RED}✗ API health check failed${NC}"
fi

if ssh $SSH_USER@$HETZNER_IP "curl -f https://$DOMAIN > /dev/null 2>&1"; then
    echo -e "${GREEN}✓ Frontend accessibility check passed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may not be immediately accessible (SSL might need time to provision)${NC}"
fi

# Set up crontabs for maintenance
echo -e "${YELLOW}Setting up maintenance crontabs...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && bash scripts/setup_crontabs.sh"

# Create initial database backup
echo -e "${YELLOW}Creating initial database backup...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose exec -T db bash /backup.sh"

# Cleanup old Docker images
echo -e "${YELLOW}Cleaning up old Docker images...${NC}"
ssh $SSH_USER@$HETZNER_IP "docker image prune -f"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}=== DEPLOYMENT SUMMARY ===${NC}"
echo -e "${YELLOW}Server:${NC} $HETZNER_IP"
echo -e "${YELLOW}Domain:${NC} https://$DOMAIN"
echo -e "${YELLOW}API:${NC} https://api.$DOMAIN"
echo -e "${YELLOW}Monitoring:${NC} https://grafana.$DOMAIN"
echo ""
echo -e "${BLUE}=== USEFUL COMMANDS ===${NC}"
echo -e "${YELLOW}View logs:${NC} ssh $SSH_USER@$HETZNER_IP \"cd $DEPLOY_PATH && docker compose logs -f\""
echo -e "${YELLOW}Check status:${NC} ssh $SSH_USER@$HETZNER_IP \"cd $DEPLOY_PATH && docker compose ps\""
echo -e "${YELLOW}Restart services:${NC} ssh $SSH_USER@$HETZNER_IP \"cd $DEPLOY_PATH && docker compose restart\""
echo -e "${YELLOW}Update deployment:${NC} bash scripts/deploy_to_hetzner.sh"
echo ""
echo -e "${GREEN}Your e-commerce application is now live! 🚀${NC}"
