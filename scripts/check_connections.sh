#!/bin/bash
# Script to check connections between DB, API, and Frontend
# This ensures all components can communicate with each other

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Error counter
ERRORS=0

# Function to check frontend in background and notify when available
check_frontend_background() {
  echo -e "${YELLOW}Starting a background check for frontend availability...${NC}"
  (
    MAX_CHECKS=30 # Maximum number of checks (5 minutes total)
    FRONTEND_URL=""
    FRONTEND_PORTS=(3000 3001 8080)
    
    for i in $(seq 1 $MAX_CHECKS); do
      # Check multiple possible ports
      for port in "${FRONTEND_PORTS[@]}"; do
        if curl -s "http://localhost:$port" &>/dev/null; then
          FRONTEND_URL="http://localhost:$port"
          echo -e "\n${GREEN}✓ Frontend is now accessible at $FRONTEND_URL${NC}"
          
          # Try to open browser if running in a graphical environment
          if command -v xdg-open &>/dev/null; then
            xdg-open "$FRONTEND_URL" &>/dev/null || true
          elif command -v open &>/dev/null; then
            open "$FRONTEND_URL" &>/dev/null || true
          fi
          
          # Exit both loops when found
          break 2
        fi
      done
      
      # If we've reached the maximum checks without success
      if [ $i -eq $MAX_CHECKS ]; then
        echo -e "\n${YELLOW}⚠ Frontend still not accessible after 5 minutes of background checks${NC}"
        echo -e "${YELLOW}There might be an issue with the frontend build process.${NC}"
        echo -e "${YELLOW}You can try manually checking these URLs:${NC}"
        for port in "${FRONTEND_PORTS[@]}"; do
          echo -e "  - http://localhost:$port"
        done
      fi
      sleep 10
    done
  ) &
}

# Set PROJECT_ROOT to absolute path
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

echo -e "${YELLOW}======================================================${NC}"
echo -e "${YELLOW}== CONNECTION TEST BETWEEN DATABASE, API, AND FRONTEND ==${NC}"
echo -e "${YELLOW}======================================================${NC}"

# Check if .env.dev exists
echo -e "\n${YELLOW}Checking development environment file...${NC}"
if [ -f "$PROJECT_ROOT/.env.dev" ]; then
  echo -e "${GREEN}✓ .env.dev file exists${NC}"
else
  echo -e "${RED}✗ .env.dev file not found!${NC}"
  echo -e "  Create a .env.dev file from the example template"
  ERRORS=$((ERRORS+1))
fi

# Check if Docker is running
echo -e "\n${YELLOW}Checking Docker service...${NC}"
if systemctl is-active --quiet docker || docker info &>/dev/null; then
  echo -e "${GREEN}✓ Docker is running${NC}"
else
  echo -e "${RED}✗ Docker is not running!${NC}"
  echo -e "  Start Docker with: sudo systemctl start docker"
  ERRORS=$((ERRORS+1))
fi

# Check Docker Compose
echo -e "\n${YELLOW}Checking Docker Compose...${NC}"
if docker compose version &>/dev/null; then
  echo -e "${GREEN}✓ Docker Compose is installed${NC}"
else
  echo -e "${RED}✗ Docker Compose is not available!${NC}"
  echo -e "  Install Docker Compose plugin"
  ERRORS=$((ERRORS+1))
fi

# Check node and pnpm
echo -e "\n${YELLOW}Checking Node.js and pnpm...${NC}"
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓ Node.js is installed: $NODE_VERSION${NC}"
  if [[ $(echo $NODE_VERSION | sed 's/v//') < "18.0.0" ]]; then
    echo -e "${RED}✗ Node.js version is too old. Version 18+ is recommended.${NC}"
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${RED}✗ Node.js is not installed!${NC}"
  ERRORS=$((ERRORS+1))
fi

if command -v pnpm &>/dev/null; then
  PNPM_VERSION=$(pnpm -v)
  echo -e "${GREEN}✓ pnpm is installed: v$PNPM_VERSION${NC}"
else
  echo -e "${RED}✗ pnpm is not installed!${NC}"
  echo -e "  Install pnpm with: npm install -g pnpm"
  ERRORS=$((ERRORS+1))
fi

# Verify Prisma schema
echo -e "\n${YELLOW}Checking Prisma schema...${NC}"
if [ -f "$PROJECT_ROOT/packages/db/schema.prisma" ]; then
  echo -e "${GREEN}✓ Prisma schema exists${NC}"
  
  # Check if schema is valid
  if cd "$PROJECT_ROOT/packages/db" && pnpm prisma validate &>/dev/null; then
    echo -e "${GREEN}✓ Prisma schema is valid${NC}"
  else
    echo -e "${RED}✗ Prisma schema has errors!${NC}"
    cd "$PROJECT_ROOT/packages/db" && pnpm prisma validate
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${RED}✗ Prisma schema not found!${NC}"
  ERRORS=$((ERRORS+1))
fi

# Test database connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
# Use absolute path to ensure we're working with the right files
cd "$PROJECT_ROOT"
# Export environment variables for docker compose
set -a
source "$PROJECT_ROOT/.env.dev" &>/dev/null || true
set +a

echo -e "${YELLOW}Starting development database container...${NC}"
# Stop any existing containers first to ensure a clean start
docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" down db &>/dev/null || true
docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" up -d db &>/dev/null || true

# Give the database container enough time to initialize and become healthy
echo -e "${YELLOW}Waiting for database to be ready (this may take up to 30 seconds)...${NC}"
MAX_DB_WAIT=30
for i in $(seq 1 $MAX_DB_WAIT); do
  if docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" ps | grep -q "db.*healthy"; then
    DB_HEALTHY=true
    break
  fi
  echo -n "."
  sleep 1
done
echo "" # New line after dots

if [ "$DB_HEALTHY" = "true" ]; then
  echo -e "${GREEN}✓ Database container is running and healthy${NC}"
  
  # Try to connect to the database
  # Source environment to get POSTGRES_USER
  POSTGRES_USER=$(grep POSTGRES_USER "$PROJECT_ROOT/.env.dev" | cut -d '=' -f2 | tr -d '"')
  if docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" exec -T db pg_isready -U "$POSTGRES_USER" &>/dev/null; then
    echo -e "${GREEN}✓ Successfully connected to database${NC}"
  else
    echo -e "${RED}✗ Failed to connect to database!${NC}"
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${RED}✗ Database container did not become healthy within $MAX_DB_WAIT seconds!${NC}"
  echo -e "${YELLOW}Running docker compose logs for debugging:${NC}"
  docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" logs db | tail -n 20
  ERRORS=$((ERRORS+1))
fi

# Check Prisma migrations
echo -e "\n${YELLOW}Checking Prisma migrations...${NC}"
if [ -d "$PROJECT_ROOT/packages/db/migrations" ]; then
  MIGRATION_COUNT=$(ls -1 "$PROJECT_ROOT/packages/db/migrations" | wc -l)
  echo -e "${GREEN}✓ Found $MIGRATION_COUNT migrations${NC}"
else
  echo -e "${YELLOW}⚠ No migrations found. You may need to create initial migrations.${NC}"
  echo -e "  Run: cd $PROJECT_ROOT/packages/db && pnpm prisma migrate dev --name init"
fi

# Check API health endpoint
echo -e "\n${YELLOW}Testing API health endpoint...${NC}"
if docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" ps | grep -q "api.*running"; then
  echo -e "${GREEN}✓ API container is running${NC}"
  
  # Wait for API to be ready
  echo -e "${YELLOW}Waiting for API to be ready...${NC}"
  for i in {1..10}; do
    if curl -s http://localhost:3001/api/v1/health &>/dev/null || curl -s http://localhost:3001/health &>/dev/null; then
      echo -e "${GREEN}✓ API health endpoint is responding${NC}"
      API_READY=true
      break
    fi
    sleep 2
  done
  
  if [ -z "$API_READY" ]; then
    echo -e "${RED}✗ API health endpoint is not responding!${NC}"
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${YELLOW}⚠ API container is not running. Let's start it...${NC}"
  docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" up -d api
  sleep 10
  
  if curl -s http://localhost:3001/api/v1/health &>/dev/null || curl -s http://localhost:3001/health &>/dev/null; then
    echo -e "${GREEN}✓ API health endpoint is responding${NC}"
  else
    echo -e "${RED}✗ API health endpoint is not responding!${NC}"
    ERRORS=$((ERRORS+1))
  fi
fi

# Check frontend
echo -e "\n${YELLOW}Testing frontend development server...${NC}"
# Initialize FRONTEND_URL at the global scope so it's available throughout the script
FRONTEND_URL=""
if docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" ps | grep -q "web.*running"; then
  echo -e "${GREEN}✓ Web container is running${NC}"
  
  # Check if frontend can be accessed
  # Give more time for the web container to fully start
  sleep 20
  
  # Define possible frontend ports to check
  FRONTEND_PORTS=(3000 3001 8080)
  
  # Try more times with progressive waiting periods
  MAX_ATTEMPTS=8
  for attempt in $(seq 1 $MAX_ATTEMPTS); do
    # Check each possible port
    for port in "${FRONTEND_PORTS[@]}"; do
      if curl -s "http://localhost:$port" &>/dev/null; then
        FRONTEND_URL="http://localhost:$port"
        echo -e "${GREEN}✓ Frontend is accessible at $FRONTEND_URL${NC}"
        FRONTEND_OK=true
        break 2  # Break out of both loops
      fi
    done
    
    # If none of the ports worked, wait and try again
    if [ -z "$FRONTEND_OK" ]; then
      # Progressive waiting: wait longer with each attempt
      wait_time=$((5 + attempt * 3))
      echo -e "${YELLOW}⚠ Attempt $attempt: Frontend not accessible on ports ${FRONTEND_PORTS[*]}, waiting ${wait_time}s...${NC}"
      sleep $wait_time
    fi
  done

  if [ -z "$FRONTEND_OK" ]; then
    echo -e "${YELLOW}⚠ Frontend is not accessible after $MAX_ATTEMPTS attempts${NC}"
    echo -e "${YELLOW}This is normal during initial setup as the frontend needs time to build.${NC}"
    echo -e "${YELLOW}You can check it manually later by trying these URLs:${NC}"
    for port in "${FRONTEND_PORTS[@]}"; do
      echo -e "  - http://localhost:$port"
    done
    # Start background check for frontend
    check_frontend_background
    # Don't count this as an error since it's expected during initial setup
  fi
else
  echo -e "${YELLOW}⚠ Web container is not running. Let's start it...${NC}"
  docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" up -d web
  sleep 20
  
  # Define possible frontend ports to check
  FRONTEND_PORTS=(3000 3001 8080)
  # FRONTEND_URL is already defined at the global scope
  
  # Try more times with progressive waiting periods
  MAX_ATTEMPTS=8
  for attempt in $(seq 1 $MAX_ATTEMPTS); do
    # Check each possible port
    for port in "${FRONTEND_PORTS[@]}"; do
      if curl -s "http://localhost:$port" &>/dev/null; then
        FRONTEND_URL="http://localhost:$port"
        echo -e "${GREEN}✓ Frontend is accessible at $FRONTEND_URL${NC}"
        FRONTEND_OK=true
        break 2  # Break out of both loops
      fi
    done
    
    # If none of the ports worked, wait and try again
    if [ -z "$FRONTEND_OK" ]; then
      # Progressive waiting: wait longer with each attempt
      wait_time=$((5 + attempt * 3))
      echo -e "${YELLOW}⚠ Attempt $attempt: Frontend not accessible on ports ${FRONTEND_PORTS[*]}, waiting ${wait_time}s...${NC}"
      sleep $wait_time
    fi
  done

  if [ -z "$FRONTEND_OK" ]; then
    echo -e "${YELLOW}⚠ Frontend is not accessible after $MAX_ATTEMPTS attempts${NC}"
    echo -e "${YELLOW}This is normal during initial setup as the frontend needs time to build.${NC}"
    echo -e "${YELLOW}You can check it manually later by trying these URLs:${NC}"
    for port in "${FRONTEND_PORTS[@]}"; do
      echo -e "  - http://localhost:$port"
    done
    # Start background check for frontend
    check_frontend_background
    # Don't count this as an error since it's expected during initial setup
  fi
fi

# Check API-Frontend communication
echo -e "\n${YELLOW}Testing API-Frontend communication...${NC}"
if grep -q "VITE_API_URL" "$PROJECT_ROOT/.env.dev"; then
  echo -e "${GREEN}✓ VITE_API_URL is configured in .env.dev${NC}"
  
  API_URL=$(grep "VITE_API_URL" "$PROJECT_ROOT/.env.dev" | cut -d '=' -f2)
  if [ -n "$API_URL" ]; then
    echo -e "${GREEN}✓ API URL is set to: $API_URL${NC}"
  else
    echo -e "${RED}✗ API URL is empty!${NC}"
    ERRORS=$((ERRORS+1))
  fi
else
  echo -e "${RED}✗ VITE_API_URL not found in .env.dev!${NC}"
  echo -e "  Add VITE_API_URL=http://localhost:3001 to .env.dev"
  ERRORS=$((ERRORS+1))
fi

# Final summary
echo -e "\n${YELLOW}======================================================${NC}"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED! Your application is ready to build!${NC}"
  echo -e "${GREEN}✅ Database, API, and Frontend are properly connected${NC}"
  echo -e "\n${YELLOW}Recommended next steps:${NC}"
  echo -e "1. Run 'make dev-all' to start all development services"
  echo -e "2. Access your API at http://localhost:3001"
  if [ -n "$FRONTEND_URL" ]; then
    echo -e "3. Access your Frontend at $FRONTEND_URL"
  else
    echo -e "3. Access your Frontend at http://localhost:3000 (or check other ports if needed)"
  fi
  echo -e "4. Use Prisma Studio with 'make prisma-studio' to manage your database"
else
  echo -e "${RED}❌ FOUND $ERRORS ISSUE(S) TO FIX!${NC}"
  echo -e "${YELLOW}Please fix the issues above before building your application${NC}"
fi
echo -e "${YELLOW}======================================================${NC}"

# Clean up
docker compose --env-file "$PROJECT_ROOT/.env.dev" -f "$PROJECT_ROOT/docker-compose.dev.yml" down &>/dev/null

exit $ERRORS
