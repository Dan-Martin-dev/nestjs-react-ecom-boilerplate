#!/bin/bash
# Update script for Hetzner Cloud server
# This script updates the application and system

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting system update process ===${NC}"

# Directory where the application is deployed
DEPLOY_PATH="/opt/monorepo-ecom"

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get autoremove -y

# Update Docker and Docker Compose if needed
echo -e "${YELLOW}Checking for Docker updates...${NC}"
LATEST_DOCKER_VERSION=$(apt-cache policy docker-ce | grep Candidate | awk '{print $2}')
CURRENT_DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
if [ "$LATEST_DOCKER_VERSION" != "$CURRENT_DOCKER_VERSION" ]; then
  echo -e "${YELLOW}Updating Docker...${NC}"
  apt-get install -y docker-ce docker-compose-plugin
fi

# Pull latest Docker images
echo -e "${YELLOW}Pulling latest Docker images...${NC}"
cd $DEPLOY_PATH
docker compose pull

# Restart services if needed
echo -e "${YELLOW}Restarting services...${NC}"
docker compose down
docker compose up -d

# Create a backup
echo -e "${YELLOW}Creating database backup...${NC}"
docker compose exec -T db /bin/bash -c "bash /backup.sh"

# Check services status
echo -e "${YELLOW}Checking service status...${NC}"
docker compose ps

# Clean up Docker system
echo -e "${YELLOW}Cleaning up Docker...${NC}"
docker system prune -af --volumes

# Print disk space information
echo -e "${YELLOW}Disk space information:${NC}"
df -h

echo -e "${GREEN}=== System update completed ===${NC}"

# Log the update
echo "System updated on $(date)" >> /var/log/system-updates.log
