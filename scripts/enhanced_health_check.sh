#!/bin/bash
# Enhanced health check script for Hetzner Cloud deployment
# This script checks the health of all services and takes corrective action if needed

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Timestamp for logs
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TIMESTAMP] Running health check..."

# Configuration - loaded from environment or defaults
DEPLOY_PATH=${DEPLOY_PATH:-"/opt/nestjs-reactjs-ecom-boilerplate"}
NOTIFICATION_EMAIL=${NOTIFICATION_EMAIL:-"admin@yourdomain.com"}
RESTART_UNHEALTHY=${RESTART_UNHEALTHY:-"true"}
MAX_CPU_PERCENT=${MAX_CPU_PERCENT:-85}
MAX_MEM_PERCENT=${MAX_MEM_PERCENT:-85}
MAX_DISK_PERCENT=${MAX_DISK_PERCENT:-85}
LOG_FILE=${LOG_FILE:-"/var/log/nestjs-reactjs-ecom-boilerplate-health.log"}

# Services to check
SERVICES=("api" "web" "db" "redis" "traefik" "prometheus" "grafana" "alertmanager" "node-exporter" "cadvisor")

# Health endpoints to check
HEALTH_ENDPOINTS=(
  "http://localhost/health"
  "http://localhost:3001/api/v1/health"
  "http://localhost:9090/-/healthy"  # Prometheus
  "http://localhost:9093/-/healthy"  # Alertmanager
  "http://localhost:3000/api/health" # Grafana
)

# Function to send notification
send_notification() {
  local subject="$1"
  local message="$2"
  local priority="$3"
  
  # Log the notification
  echo "[$TIMESTAMP] $priority: $subject - $message" >> $LOG_FILE
  
  # Send email notification
  echo "$message" | mail -s "[$priority] $subject" $NOTIFICATION_EMAIL
  
  # If Slack webhook is configured, send to Slack
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"[$priority] $subject\nServer: $(hostname)\nTime: $TIMESTAMP\n\n$message\"}" \
      $SLACK_WEBHOOK_URL
  fi
}

# Ensure we're in the correct directory
cd $DEPLOY_PATH || {
  send_notification "Health check error" "Cannot change to directory $DEPLOY_PATH" "ERROR"
  exit 1
}

# Check Docker services
echo -e "${YELLOW}Checking Docker services...${NC}"
for SERVICE in "${SERVICES[@]}"; do
  if docker compose ps --format json $SERVICE 2>/dev/null | grep -q "running"; then
    echo -e "${GREEN}✓ Service $SERVICE is running${NC}"
  else
    echo -e "${RED}✗ Service $SERVICE is not running${NC}"
    
    # Get the status and logs
    STATUS=$(docker compose ps --format json $SERVICE 2>/dev/null | jq -r '.[].State' 2>/dev/null || echo "unknown")
    LOGS=$(docker compose logs --tail 20 $SERVICE 2>&1)
    
    # Send notification
    send_notification "Service $SERVICE is down" "Status: $STATUS\n\nLogs:\n$LOGS" "CRITICAL"
    
    # Attempt to restart if configured
    if [ "$RESTART_UNHEALTHY" = "true" ]; then
      echo -e "${YELLOW}Attempting to restart $SERVICE...${NC}"
      docker compose restart $SERVICE
      sleep 10
      
      # Check if service is now running
      if docker compose ps --format json $SERVICE 2>/dev/null | grep -q "running"; then
        echo -e "${GREEN}✓ Service $SERVICE successfully restarted${NC}"
        send_notification "Service $SERVICE restarted" "Service was down but has been successfully restarted." "INFO"
      else
        echo -e "${RED}✗ Failed to restart service $SERVICE${NC}"
        send_notification "Failed to restart $SERVICE" "Attempted restart but service is still down." "CRITICAL"
      fi
    fi
  fi
done

# Check HTTP health endpoints
echo -e "${YELLOW}Checking HTTP health endpoints...${NC}"
for ENDPOINT in "${HEALTH_ENDPOINTS[@]}"; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT 2>/dev/null || echo "failed")
  
  if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Endpoint $ENDPOINT is healthy${NC}"
  else
    echo -e "${RED}✗ Endpoint $ENDPOINT returned status $HTTP_STATUS${NC}"
    send_notification "Unhealthy endpoint" "Endpoint $ENDPOINT returned status $HTTP_STATUS" "WARNING"
  fi
done

# Check system resources
# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt $MAX_DISK_PERCENT ]; then
  echo -e "${RED}✗ Disk usage is critical: $DISK_USAGE%${NC}"
  send_notification "Disk space critical" "Disk usage is at $DISK_USAGE%" "WARNING"
else
  echo -e "${GREEN}✓ Disk usage is normal: $DISK_USAGE%${NC}"
fi

# Check memory
TOTAL_MEM=$(free -m | awk 'NR==2 {print $2}')
USED_MEM=$(free -m | awk 'NR==2 {print $3}')
MEM_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

if [ $MEM_PERCENT -gt $MAX_MEM_PERCENT ]; then
  echo -e "${RED}✗ Memory usage is high: ${MEM_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)${NC}"
  send_notification "Memory usage high" "Memory usage is at ${MEM_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)" "WARNING"
else
  echo -e "${GREEN}✓ Memory usage is normal: ${MEM_PERCENT}% (${USED_MEM}MB/${TOTAL_MEM}MB)${NC}"
fi

# Check CPU load
LOAD=$(uptime | awk -F'[a-z]:' '{ print $2}' | awk -F',' '{print $1}' | sed 's/ //g')
CORES=$(nproc)
LOAD_PER_CORE=$(echo "$LOAD/$CORES" | bc -l)
LOAD_PERCENT=$(echo "$LOAD_PER_CORE * 100" | bc -l | cut -d. -f1)

if [ $LOAD_PERCENT -gt $MAX_CPU_PERCENT ]; then
  echo -e "${RED}✗ CPU load is high: $LOAD (${LOAD_PERCENT}% per core)${NC}"
  send_notification "High CPU load" "CPU load is at ${LOAD_PERCENT}% per core (${LOAD} on ${CORES} cores)" "WARNING"
else
  echo -e "${GREEN}✓ CPU load is normal: $LOAD (${LOAD_PERCENT}% per core)${NC}"
fi

# Generate health report
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
  echo "Container Stats:"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
} > $REPORT_FILE

echo -e "${GREEN}Health check completed. Report saved to $REPORT_FILE${NC}"

# Send daily report if it's midnight (optional)
HOUR=$(date +%H)
if [ "$HOUR" == "00" ]; then
  send_notification "Daily health report" "$(cat $REPORT_FILE)" "INFO"
fi

exit 0
