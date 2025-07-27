#!/bin/bash
# Initialize the database and create initial migrations

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Initializing database and migrations ===${NC}"

# Ensure we're in the project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Check if .env.dev exists
if [ ! -f ".env.dev" ]; then
  echo -e "${RED}Error: .env.dev file not found!${NC}"
  echo -e "Please create a .env.dev file first."
  exit 1
fi

# Start the database container if it's not running
echo -e "${YELLOW}Ensuring database container is running...${NC}"
docker compose -f "$PROJECT_ROOT/docker-compose.dev.yml" up -d db
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

# Check if database is ready
DB_READY=false
for i in {1..30}; do
  if docker compose -f "$PROJECT_ROOT/docker-compose.dev.yml" exec -T db pg_isready &>/dev/null; then
    DB_READY=true
    echo -e "${GREEN}✓ Database is ready${NC}"
    break
  fi
  echo -e "${YELLOW}Waiting for database to be ready (attempt $i/30)...${NC}"
  sleep 1
done

if [ "$DB_READY" != "true" ]; then
  echo -e "${RED}Error: Database is not ready after 30 seconds!${NC}"
  exit 1
fi

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
cd "$PROJECT_ROOT/packages/db" && pnpm prisma generate
if [ $? -ne 0 ]; then
  echo -e "${RED}Error generating Prisma client!${NC}"
  exit 1
fi

# Check if migrations directory exists and contains migrations
if [ -d "$PROJECT_ROOT/packages/db/migrations" ] && [ "$(ls -A $PROJECT_ROOT/packages/db/migrations 2>/dev/null)" ]; then
  echo -e "${YELLOW}Migrations directory already exists with migrations.${NC}"
  echo -e "${YELLOW}Running existing migrations...${NC}"
  cd "$PROJECT_ROOT/packages/db" && pnpm prisma migrate dev
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error applying migrations!${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}Creating initial migration...${NC}"
  cd "$PROJECT_ROOT/packages/db" && pnpm prisma migrate dev --name init
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error creating initial migration!${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Database initialized successfully!${NC}"
echo -e "${GREEN}✓ Migrations applied!${NC}"
echo -e "\nYou can now run: ${YELLOW}make dev-all${NC} to start all services"
