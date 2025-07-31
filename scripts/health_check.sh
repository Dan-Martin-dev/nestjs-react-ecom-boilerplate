# Simple health check script for Hetzner Cloud
# This script checks the health of your application services
# and sends notifications if anything is down

#!/bin/bash

# Configuration
DEPLOY_PATH="/opt/nestjs-reactjs-ecom-boilerplate"
NOTIFICATION_EMAIL="your-email@example.com"
SERVICES=("api" "web" "db" "redis" "traefik" "prometheus" "grafana" "alertmanager" "node-exporter" "cadvisor")
HOST="localhost"
HEALTH_ENDPOINTS=(
  "http://localhost/health"
  "http://localhost:3001/api/v1/health"
  "http://localhost:9090/-/healthy"  # Prometheus
  "http://localhost:9093/-/healthy"  # Alertmanager
  "http://localhost:3000/api/health" # Grafana
)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker services
echo -e "${YELLOW}Checking Docker services...${NC}"
cd $DEPLOY_PATH

for SERVICE in "${SERVICES[@]}"; do
  STATUS=$(docker compose ps --format json $SERVICE | jq -r '.[].State')
  
  if [ "$STATUS" == "running" ]; then
    echo -e "${GREEN}✓ Service $SERVICE is up${NC}"
  else
    echo -e "${RED}✗ Service $SERVICE is down (Status: $STATUS)${NC}"
    echo "Service $SERVICE is down (Status: $STATUS) on $(hostname) at $(date)" | \
      mail -s "ALERT: Service Down on $(hostname)" $NOTIFICATION_EMAIL
  fi
done

# Check HTTP health endpoints
echo -e "${YELLOW}Checking HTTP health endpoints...${NC}"

for ENDPOINT in "${HEALTH_ENDPOINTS[@]}"; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)
  
  if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Endpoint $ENDPOINT is healthy${NC}"
  else
    echo -e "${RED}✗ Endpoint $ENDPOINT returned status $HTTP_STATUS${NC}"
    echo "Endpoint $ENDPOINT returned status $HTTP_STATUS on $(hostname) at $(date)" | \
      mail -s "ALERT: Endpoint Unhealthy on $(hostname)" $NOTIFICATION_EMAIL
  fi
done

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
  echo -e "${RED}✗ Disk usage is critical: $DISK_USAGE%${NC}"
  echo "Disk usage is critical: $DISK_USAGE% on $(hostname) at $(date)" | \
    mail -s "ALERT: Disk Space Critical on $(hostname)" $NOTIFICATION_EMAIL
else
  echo -e "${GREEN}✓ Disk usage is normal: $DISK_USAGE%${NC}"
fi

# Check memory
FREE_MEM=$(free -m | awk 'NR==2 {print $4}')
if [ $FREE_MEM -lt 512 ]; then  # Less than 512MB free
  echo -e "${RED}✗ Free memory is low: ${FREE_MEM}MB${NC}"
  echo "Free memory is low: ${FREE_MEM}MB on $(hostname) at $(date)" | \
    mail -s "ALERT: Memory Low on $(hostname)" $NOTIFICATION_EMAIL
else
  echo -e "${GREEN}✓ Free memory is adequate: ${FREE_MEM}MB${NC}"
fi

# Check CPU load
LOAD=$(uptime | awk -F'[a-z]:' '{ print $2}' | awk -F',' '{print $1}' | sed 's/ //g')
CORES=$(nproc)
LOAD_PER_CORE=$(echo "$LOAD/$CORES" | bc -l)

if (( $(echo "$LOAD_PER_CORE > 1.5" | bc -l) )); then
  echo -e "${RED}✗ CPU load is high: $LOAD (${LOAD_PER_CORE} per core)${NC}"
  echo "CPU load is high: $LOAD (${LOAD_PER_CORE} per core) on $(hostname) at $(date)" | \
    mail -s "ALERT: High CPU Load on $(hostname)" $NOTIFICATION_EMAIL
else
  echo -e "${GREEN}✓ CPU load is normal: $LOAD (${LOAD_PER_CORE} per core)${NC}"
fi

# Generate a simple report
echo -e "${YELLOW}Generating health report...${NC}"
REPORT_FILE="/tmp/health_report_$(date +%Y%m%d).txt"

{
  echo "Health Report for $(hostname) at $(date)"
  echo "---------------------------------------"
  echo ""
  echo "System Information:"
  echo "- Uptime: $(uptime -p)"
  echo "- Load Average: $(uptime | awk -F'[a-z]:' '{ print $2}')"
  echo "- Memory: $(free -h | awk 'NR==2 {print "Total: " $2 ", Used: " $3 ", Free: " $4}')"
  echo "- Disk: $(df -h / | awk 'NR==2 {print "Total: " $2 ", Used: " $3 ", Free: " $4 ", Usage: " $5}')"
  echo ""
  echo "Docker Containers:"
  docker compose ps
  echo ""
  echo "Recent Logs:"
  docker compose logs --tail 20
} > $REPORT_FILE

echo -e "${GREEN}Health check completed. Report saved to $REPORT_FILE${NC}"
