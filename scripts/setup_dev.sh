#!/bin/bash
# Script to set up development environment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Setting up development environment ===${NC}"

# Ensure scripts and child processes use the repository .env by default
export DOTENV_CONFIG_PATH="$(pwd)/.env"

# Check if .env.dev exists, if not create it from example
if [ ! -f ".env.dev" ]; then
  if [ -f ".env.dev.example" ]; then
    echo -e "${YELLOW}Creating .env.dev from example...${NC}"
    cp .env.dev.example .env.dev
    echo -e "${GREEN}✓ Created .env.dev${NC}"
  else
    echo -e "${RED}Error: .env.dev.example not found!${NC}"
    exit 1
  fi
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
pnpm --filter @repo/db db:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Start development database
echo -e "${YELLOW}Starting development database...${NC}"
docker compose -f docker-compose.dev.yml up -d db redis
echo -e "${GREEN}✓ Database started${NC}"

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
for i in {1..30}; do
  if docker compose -f docker-compose.dev.yml exec -T db pg_isready &>/dev/null; then
    echo -e "${GREEN}✓ Database is ready${NC}"
    DB_READY=true
    break
  fi
  sleep 1
done

if [ -z "$DB_READY" ]; then
  echo -e "${RED}Error: Database is not ready after 30 seconds!${NC}"
  exit 1
fi

# Check if we need to run migrations
echo -e "${YELLOW}Checking if migrations are needed...${NC}"
MIGRATION_DIR="packages/db/migrations"

if [ ! -d "$MIGRATION_DIR" ] || [ -z "$(ls -A $MIGRATION_DIR 2>/dev/null)" ]; then
  echo -e "${YELLOW}No migrations found. Creating initial migration...${NC}"
  cd packages/db && pnpm prisma migrate dev --name init
  echo -e "${GREEN}✓ Initial migration created${NC}"
else
  echo -e "${YELLOW}Running existing migrations...${NC}"
  cd packages/db && pnpm prisma migrate dev
  echo -e "${GREEN}✓ Migrations applied${NC}"
fi

# Build applications
echo -e "${YELLOW}Building applications...${NC}"
pnpm build
echo -e "${GREEN}✓ Applications built${NC}"

echo -e "${GREEN}=== Development environment setup complete! ===${NC}"
echo -e "You can now run ${YELLOW}make dev-all${NC} to start all services"
echo -e "Or run ${YELLOW}make check-connections${NC} to verify connections between components"
