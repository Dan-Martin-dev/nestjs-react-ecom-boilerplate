#!/bin/bash
# Deployment script for Hetzner Cloud
# This script deploys the monorepo ecommerce application to a Hetzner server

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - update these values
SSH_USER="root"
HETZNER_IP=$(grep HETZNER_SERVER_IP .env.production | cut -d '=' -f2 | tr -d '"')
REPO_URL="https://github.com/yourusername/monorepo-ecom.git"
DEPLOY_PATH="/opt/monorepo-ecom"

if [ -z "$HETZNER_IP" ]; then
  echo -e "${RED}Error: HETZNER_SERVER_IP not found in .env.production${NC}"
  echo -e "${YELLOW}Please update the .env.production file with your server IP${NC}"
  exit 1
fi

echo -e "${GREEN}Starting deployment to Hetzner Cloud server at $HETZNER_IP...${NC}"

# Check SSH connection
echo -e "${YELLOW}Checking SSH connection...${NC}"
ssh -o StrictHostKeyChecking=no $SSH_USER@$HETZNER_IP "echo 'Connection successful'"

# Install Docker and Docker Compose if not already installed
echo -e "${YELLOW}Ensuring Docker and Docker Compose are installed...${NC}"
ssh $SSH_USER@$HETZNER_IP "which docker > /dev/null || \
  (apt-get update && apt-get install -y apt-transport-https ca-certificates curl software-properties-common && \
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
  add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" && \
  apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io)"

ssh $SSH_USER@$HETZNER_IP "which docker-compose > /dev/null || \
  (apt-get update && apt-get install -y docker-compose-plugin)"

# Create deployment directory if it doesn't exist
echo -e "${YELLOW}Creating deployment directory...${NC}"
ssh $SSH_USER@$HETZNER_IP "mkdir -p $DEPLOY_PATH"

# Copy production files to server
echo -e "${YELLOW}Copying files to server...${NC}"
scp docker-compose.prod.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/docker-compose.yml
scp .env.production $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/.env
scp -r scripts/backup.sh $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/scripts/

# Copy monitoring configuration
echo -e "${YELLOW}Copying monitoring configuration...${NC}"
ssh $SSH_USER@$HETZNER_IP "mkdir -p $DEPLOY_PATH/monitoring/templates"
scp -r monitoring/prometheus.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/
scp -r monitoring/alertmanager.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/
scp -r monitoring/alerts.yml $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/
scp -r monitoring/templates/* $SSH_USER@$HETZNER_IP:$DEPLOY_PATH/monitoring/templates/

# Build and start services on the remote server
echo -e "${YELLOW}Starting services...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose pull && docker compose up -d"

# Check if services are running
echo -e "${YELLOW}Checking service status...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose ps"

# Set up crontabs for maintenance
echo -e "${YELLOW}Setting up maintenance crontabs...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && bash scripts/setup_crontabs.sh"

# Create initial database backup
echo -e "${YELLOW}Creating initial database backup...${NC}"
ssh $SSH_USER@$HETZNER_IP "cd $DEPLOY_PATH && docker compose exec -T db /bin/bash -c 'bash /backup.sh'"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}To check logs: ssh $SSH_USER@$HETZNER_IP \"cd $DEPLOY_PATH && docker compose logs -f\"${NC}"
echo -e "${YELLOW}Monitoring dashboard available at: https://grafana.yourdomain.com${NC}"
echo -e "${YELLOW}API available at: https://api.yourdomain.com${NC}"
echo -e "${YELLOW}Frontend available at: https://yourdomain.com${NC}"
