#!/bin/bash
# Setup crontabs for automated maintenance tasks

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DEPLOY_PATH="/opt/nestjs-reactjs-ecom-boilerplate"
SCRIPTS_PATH="$DEPLOY_PATH/scripts"

echo -e "${YELLOW}Setting up maintenance crontabs...${NC}"

# Make sure all scripts are executable
chmod +x $SCRIPTS_PATH/*.sh

# Create temporary crontab file
TMP_CRONTAB=$(mktemp)

# Read existing crontab
crontab -l > $TMP_CRONTAB 2>/dev/null || echo "# Monorepo E-commerce Maintenance Tasks" > $TMP_CRONTAB

# Add maintenance tasks if they don't exist
grep -q "health_check.sh" $TMP_CRONTAB || \
  echo "*/15 * * * * $SCRIPTS_PATH/health_check.sh >> /var/log/health_check.log 2>&1" >> $TMP_CRONTAB

grep -q "update.sh" $TMP_CRONTAB || \
  echo "0 3 * * 1 $SCRIPTS_PATH/update.sh >> /var/log/update.log 2>&1" >> $TMP_CRONTAB

# Log rotation for our custom logs
grep -q "logrotate" $TMP_CRONTAB || \
  echo "0 0 * * * logrotate /etc/logrotate.d/docker-containers" >> $TMP_CRONTAB

# Install the new crontab
crontab $TMP_CRONTAB
rm $TMP_CRONTAB

echo -e "${GREEN}Crontabs installed successfully!${NC}"
echo "Current crontab:"
crontab -l
