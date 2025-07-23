# ==============================================================================
# Turborepo Ecom Monorepo Makefile
#
# Best practices for Node.js, Docker, Prisma, CI/CD, and Ops
# ==============================================================================

# Define variables for Compose files to avoid repetition
DEV_COMPOSE_FILE = docker-compose.dev.yml
PROD_COMPOSE_FILE = docker-compose.prod.yml

.PHONY: help install build test lint prisma-generate prisma-migrate dev docker-build-dev docker-build-prod docker-up-dev docker-up-prod docker-down-dev docker-down-prod docker-logs-dev docker-logs-prod docker-prune clean backup-db deploy

# Show help
help:
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "----------------------- Local Development -----------------------"
	@echo "  install            Install all pnpm dependencies"
	@echo "  build              Build all apps and packages via Turborepo"
	@echo "  test               Run all tests via Turborepo"
	@echo "  lint               Lint all code via Turborepo"
	@echo "  dev                Start local dev servers (non-Docker)"
	@echo ""
	@echo "----------------------- Docker Lifecycle (Dev) ------------------"
	@echo "  docker-build-dev   Build Docker images for development"
	@echo "  docker-up-dev      Build and start dev containers"
	@echo "  docker-down-dev    Stop and remove dev containers and volumes"
	@echo "  docker-logs-dev    Follow logs from all dev containers"
	@echo ""
	@echo "----------------------- Docker Lifecycle (Prod) -----------------"
	@echo "  docker-build-prod  Build Docker images for production"
	@echo "  docker-up-prod     Build and start prod containers in detached mode"
	@echo "  docker-down-prod   Stop and remove prod containers and volumes"
	@echo "  docker-logs-prod   Follow logs from all prod containers"
	@echo ""
	@echo "----------------------- Database & Tooling ----------------------"
	@echo "  prisma-generate    Generate Prisma client from schema"
	@echo "  prisma-migrate     Run database migrations using Prisma"
	@echo "  backup-db          Run the database backup script"
	@echo ""
	@echo "----------------------- Cleanup & Deployment --------------------"
	@echo "  docker-prune       Remove dangling Docker images and build cache"
	@echo "  clean              Stop all containers and perform a full system prune"
	@echo "  deploy             Trigger the CI/CD deployment workflow"
	@echo ""

# ==============================================================================
# LOCAL DEVELOPMENT
# ==============================================================================

install:
	pnpm install

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

dev:
	pnpm turbo run dev

# ==============================================================================
# DOCKER LIFECYCLE
# ==============================================================================

# Build images without starting containers
docker-build:
	docker compose -f $(DEV_COMPOSE_FILE) --env-file .env.dev build

docker-build-prod:
	docker compose -f $(PROD_COMPOSE_FILE) --env-file .env.production build

# Build and start containers
docker-up:
	docker compose -f $(DEV_COMPOSE_FILE) --env-file .env.dev up --build

docker-up-prod:
	docker compose -f $(PROD_COMPOSE_FILE) --env-file .env.production up --build -d

# Stop and remove containers, networks, and volumes
docker-down:
	docker compose -f $(DEV_COMPOSE_FILE) --env-file .env.dev down -v --remove-orphans

docker-down-prod:
	docker compose -f $(PROD_COMPOSE_FILE) --env-file .env.production down -v --remove-orphans

# Follow container logs
docker-logs:
	docker compose -f $(DEV_COMPOSE_FILE) --env-file .env.dev logs -f

docker-logs-prod:
	docker compose -f $(PROD_COMPOSE_FILE) --env-file .env.production logs -f

# ==============================================================================
# DATABASE & TOOLING
# ==============================================================================

prisma-generate:
	pnpm --filter @repo/db db:generate

prisma-migrate:
	pnpm --filter @repo/db db:migrate

backup-db:
	bash scripts/backup.sh

# ==============================================================================
# CLEANUP & DEPLOYMENT
# ==============================================================================

# Clean up dangling Docker images and build cache
docker-prune:
	docker image prune -f
	docker builder prune -f

# Stop all containers and run a full prune
clean: docker-down-dev docker-down-prod docker-prune

# Trigger CI/CD pipeline
deploy:
	gh workflow run deploy.yml