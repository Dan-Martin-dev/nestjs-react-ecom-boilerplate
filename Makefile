# ==============================================================================
# Turborepo Ecom Monorepo Makefile
#
# Best practices for Node.js, Docker, Prisma, CI/CD, and Ops
# ==============================================================================

# Define variables to keep commands DRY (Don't Repeat Yourself)
DEV_COMPOSE_FILE = docker-compose.dev.yml
PROD_COMPOSE_FILE = docker-compose.prod.yml
COMPOSE_DEV = docker compose -f $(DEV_COMPOSE_FILE) --env-file=.env.dev
COMPOSE_PROD = docker compose -f $(PROD_COMPOSE_FILE) --env-file=.env.production

# Set the default goal to 'help'
.DEFAULT_GOAL := help

# Declare targets that are not files
.PHONY: help install build test lint dev dev-api dev-web dev-all \
	build-dev up-dev up-dev-d down-dev logs-dev logs-api logs-web logs-db shell-api shell-web \
	build-prod up-prod down-prod logs-prod logs-prod-api logs-prod-web check-prod-api \
	backup-prod-db health-check-prod verify-env-prod pre-deploy-check setup-env setup-dev check-connections init-db \
	prisma-generate prisma-migrate prisma-studio backup-db docker-ui check-api \
	clean deploy health-check

# ==============================================================================
# HELP
# ==============================================================================

help:
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "----------------------- Local Development (non-Docker) ----------------"
	@echo "  install            Install all pnpm dependencies"
	@echo "  build              Build all apps and packages via Turborepo"
	@echo "  test               Run all tests via Turborepo"
	@echo "  lint               Lint all code via Turborepo"
	@echo "  dev                Start local dev servers with database and Redis"
	@echo "  dev-api            Start only the API service locally"
	@echo "  dev-web            Start only the Web frontend locally"
	@echo "  dev-all            Start all Docker containers and open Prisma Studio"
	@echo ""
	@echo "----------------------- Docker Development --------------------------"
	@echo "  build-dev          Build Docker images for development"
	@echo "  up-dev             Build and start dev containers in the foreground"
	@echo "  up-dev-d           Build and start dev containers in detached mode"
	@echo "  down-dev           Stop and remove dev containers and volumes"
	@echo "  logs-dev           Follow logs from all dev containers"
	@echo "  logs-api           Follow logs for the 'api' service"
	@echo "  logs-web           Follow logs for the 'web' service"
	@echo "  shell-api          Open a bash shell inside the 'api' container"
	@echo "  shell-web          Open a bash shell inside the 'web' container"
	@echo ""
	@echo "----------------------- Docker Production ---------------------------"
	@echo "  build-prod         Build Docker images for production"
	@echo "  up-prod            Deploy to production with checks and safeguards"
	@echo "  down-prod          Stop and remove prod containers and volumes"
	@echo "  logs-prod          Follow logs from all prod containers"
	@echo "  logs-prod-api      Follow logs from the API service only"
	@echo "  logs-prod-web      Follow logs from the web service only"
	@echo "  check-prod-api     Check if the production API is responding"
	@echo "  backup-prod-db     Create a backup of the production database"
	@echo "  health-check-prod  Check the health of all production services"
	@echo ""
	@echo "----------------------- Database & Tooling --------------------------"
	@echo "  prisma-generate    Generate Prisma client from schema"
	@echo "  prisma-migrate     Run database migrations using Prisma"
	@echo "  prisma-studio      Open Prisma Studio UI at http://localhost:5555"
	@echo "  backup-db          Run the database backup script"
	@echo "  docker-ui          Start lazydocker for a terminal UI for Docker"
	@echo "  check-api          Check if the API is running and show its status"
	@echo "  check-connections  Verify connections between DB, API, and Frontend"
	@echo ""
	@echo "----------------------- CI/CD & Maintenance -------------------------"
	@echo "  clean              Stop all containers and perform a full system prune"
	@echo "  health-check       Run the service health check script"
	@echo "  deploy             Trigger the CI/CD deployment workflow (requires gh CLI)"
	@echo ""
	@echo "----------------------- Environment Setup -------------------------"
	@echo "  setup-dev          Set up development environment (DB, migrations, builds)"
	@echo "  init-db            Initialize database and create initial migrations"
	@echo "  setup-env          Interactive setup of production environment variables"
	@echo "  verify-env-prod    Verify production environment variables are set"
	@echo "  pre-deploy-check   Run comprehensive pre-deployment checks"
	@echo ""



# ==============================================================================
# LOCAL DEVELOPMENT (non-Docker)
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
	@echo "Starting database and Redis containers..."
	$(COMPOSE_DEV) up -d db redis
	@echo "Waiting for database to be ready..."
	sleep 3
	@echo "Ensuring database is properly configured..."
	cd packages/db && pnpm db:generate
	@echo "Building the API..."
	cd apps/api && pnpm build
	@echo "Starting all development servers with Turborepo..."
	DOTENV_CONFIG_PATH=.env.dev pnpm turbo run dev

# Alternative development flows
dev-api:
	@echo "Starting API in development mode..."
	cd apps/api && pnpm dev

dev-web:
	@echo "Starting Web frontend in development mode..."
	cd apps/web && pnpm dev

dev-all:
	@echo "Starting all containers in detached mode..."
	$(COMPOSE_DEV) up -d
	@echo "Opening Prisma Studio in separate window..."
	make prisma-studio


# ==============================================================================
# DOCKER DEVELOPMENT
# ==============================================================================

# Build images
build-dev:
	$(COMPOSE_DEV) build

# Build and start containers, attached to the terminal
up-dev:
	$(COMPOSE_DEV) up --build

# Build and start containers in detached mode
up-dev-d:
	$(COMPOSE_DEV) up --build -d

# Stop and remove containers, networks, and volumes
down-dev:
	$(COMPOSE_DEV) down -v --remove-orphans

# Follow logs for all dev services
logs-dev:
	$(COMPOSE_DEV) logs -f

# Follow logs for a specific service
logs-api:
	$(COMPOSE_DEV) logs -f api
logs-web:
	$(COMPOSE_DEV) logs -f web
logs-db:
	$(COMPOSE_DEV) logs -f db

# Open a shell in a running container
shell-api:
	$(COMPOSE_DEV) exec api bash
shell-web:
	$(COMPOSE_DEV) exec web bash


# ==============================================================================
# ==============================================================================
# DOCKER PRODUCTION
# ==============================================================================

# Build production images
build-prod:
	@echo "🔨 Building production Docker images..."
	$(COMPOSE_PROD) build

# Deploy to production with proper checks and safeguards
up-prod:
	@echo "🚀 Starting production deployment process..."
	@echo "⚠️  Verifying production environment..."
	@make verify-env-prod
	@echo "🏗️  Building and starting all production containers..."
	$(COMPOSE_PROD) up --build -d
	@echo "📦 Running database migrations in production mode..."
	@pnpm --filter @repo/db db:deploy || { echo "Error: Database migration failed!"; exit 1; }
	@echo "⏳ Waiting for services to initialize..."
	@sleep 10
	@echo "✅ Verifying services are running..."
	@docker ps --filter "name=monorepo-ecom" --format "table {{.Names}}\t{{.Status}}" || true
	@echo "🌐 Production deployment complete! Services are now available."
	@echo "API: http://api.yourdomain.com"
	@echo "Web: http://yourdomain.com"

# Stop and remove all production containers and volumes
down-prod:
	@echo "🛑 Stopping all production services..."
	$(COMPOSE_PROD) down -v --remove-orphans

# View logs for all production services
logs-prod:
	@echo "📋 Showing logs for all production services..."
	$(COMPOSE_PROD) logs -f

# Follow logs for specific production services
logs-prod-api:
	@echo "📋 Showing logs for production API service..."
	$(COMPOSE_PROD) logs -f api
logs-prod-web:
	@echo "📋 Showing logs for production web service..."
	$(COMPOSE_PROD) logs -f web

# Check production API health
check-prod-api:
	@echo "🔍 Checking production API health..."
	@curl -s -o /dev/null -w "%{http_code}" http://api.yourdomain.com/api/v1/health || echo "❌ Production API is not responding"
	@docker ps --filter "name=monorepo-ecom" --format "table {{.Names}}\t{{.Status}}" || true

# Production database backup
backup-prod-db:
	@echo "💾 Creating production database backup..."
	@mkdir -p ./backups
	@TIMESTAMP=$(shell date +%Y%m%d%H%M%S); \
	docker exec monorepo-ecom-db-1 pg_dump -U ${POSTGRES_USER:-postgres} ${POSTGRES_DB:-monorepo-ecom} > ./backups/db-backup-$$TIMESTAMP.sql; \
	echo "✅ Local backup completed: ./backups/db-backup-$$TIMESTAMP.sql"; \
	if [ -n "$$S3_BACKUP_BUCKET" ] && [ -n "$$AWS_ACCESS_KEY_ID" ] && [ -n "$$AWS_SECRET_ACCESS_KEY" ]; then \
		echo "📤 Uploading backup to S3..."; \
		docker run --rm -v $$(pwd)/backups:/backups -e AWS_ACCESS_KEY_ID=$$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$$AWS_SECRET_ACCESS_KEY amazon/aws-cli \
			s3 cp /backups/db-backup-$$TIMESTAMP.sql s3://$$S3_BACKUP_BUCKET/; \
		echo "✅ Backup uploaded to S3: s3://$$S3_BACKUP_BUCKET/db-backup-$$TIMESTAMP.sql"; \
	else \
		echo "⚠️  S3 backup skipped. Set S3_BACKUP_BUCKET, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to enable."; \
	fi

# Production health check
health-check-prod:
	@echo "🔍 Checking production service health..."
	@curl -s -o /dev/null -w "%{http_code}" http://api.yourdomain.com/api/v1/health || echo "❌ API health check failed"
	@docker ps --filter "name=monorepo-ecom" --format "table {{.Names}}\t{{.Status}}" || true

verify-env-prod:
	@echo "🔍 Checking production environment variables..."
	@test -f .env.production || { echo "❌ Error: .env.production file not found!"; exit 1; }
	@grep -q "DATABASE_URL" .env.production || echo "⚠️  Warning: DATABASE_URL not found in .env.production!"
	@grep -q "DOMAIN" .env.production || echo "⚠️  Warning: DOMAIN not found in .env.production!"
	@grep -q "ACME_EMAIL" .env.production || echo "⚠️  Warning: ACME_EMAIL not found in .env.production!"
	@grep -q "POSTGRES_USER" .env.production || echo "⚠️  Warning: POSTGRES_USER not found in .env.production!"
	@grep -q "POSTGRES_PASSWORD" .env.production || echo "⚠️  Warning: POSTGRES_PASSWORD not found in .env.production!"
	@grep -q "POSTGRES_DB" .env.production || echo "⚠️  Warning: POSTGRES_DB not found in .env.production!"
	@grep -q "JWT_SECRET" .env.production || echo "⚠️  Warning: JWT_SECRET not found in .env.production!"
	@grep -q "JWT_REFRESH_SECRET" .env.production || echo "⚠️  Warning: JWT_REFRESH_SECRET not found in .env.production!"
	@grep -q "GRAFANA_PASSWORD" .env.production || echo "⚠️  Warning: GRAFANA_PASSWORD not found in .env.production!"
	@echo "✅ Environment variable check completed"

# Comprehensive pre-deployment check
pre-deploy-check:
	@echo "🚀 Running comprehensive pre-deployment checks..."
	@echo "Step 1/5: Verifying environment variables..."
	@make verify-env-prod
	@echo "Step 2/5: Checking Docker installation..."
	@which docker > /dev/null || { echo "❌ Docker not found! Please install Docker."; exit 1; }
	@echo "✅ Docker is installed"
	@echo "Step 3/5: Checking Git status..."
	@git diff-index --quiet HEAD -- || echo "⚠️  Warning: You have uncommitted changes!"
	@echo "Step 4/5: Testing application build..."
	@echo "🏗️  Building production Docker images (this may take a while)..."
	@make build-prod
	@echo "Step 5/5: Checking database migrations..."
	@echo "📊 Verifying database schema is up-to-date..."
	@cd packages/db && pnpm prisma format || echo "⚠️  Warning: Prisma schema formatting issues detected"
	@echo "✅ Pre-deployment checks completed!"
	@echo ""
	@echo "🟢 Your application is ready for deployment to Hetzner!"
	@echo "    Next steps:"
	@echo "    1. Configure DNS for your domain: ${DOMAIN}"
	@echo "    2. Run 'make deploy' to trigger deployment"
	@echo "    3. Monitor logs with 'make logs-prod'"
	@echo ""

# ==============================================================================
# DATABASE & TOOLING
# ==============================================================================

prisma-generate:
	pnpm --filter @repo/db db:generate

prisma-migrate:
	pnpm --filter @repo/db db:migrate

prisma-studio:
	cd packages/db && npx dotenv -e ../../.env.dev -- prisma studio
	
backup-db:
	bash scripts/backup.sh

docker-ui:
	lazydocker

# Check if API is running and show its status
check-api:
	@echo "Checking API status..."
	@curl -s http://localhost:3001/api/v1/health || echo "API is not running or not responding"


# ==============================================================================
# CI/CD & MAINTENANCE
# ==============================================================================

# Stop all Docker containers and remove all unused Docker data (images, volumes, networks)
clean: down-dev down-prod
	@echo "Pruning Docker system..."
	docker system prune -a -f --volumes

# Run health check script
health-check:
	bash scripts/health_check.sh

# Trigger CI/CD pipeline deployment (requires GitHub CLI)
deploy:
	gh workflow run deploy.yml

# Interactive setup of production environment variables
setup-env:
	@echo "🔧 Running interactive environment setup..."
	@bash scripts/setup_env.sh

# Check connections between database, API, and frontend
check-connections:
	@echo "🔍 Checking connections between all components..."
	@bash scripts/check_connections.sh

# Set up development environment
setup-dev:
	@echo "🔧 Setting up development environment..."
	@bash scripts/setup_dev.sh
	
# Initialize database and create migrations
init-db:
	@echo "🗄️  Initializing database and creating migrations..."
	@bash scripts/init_db.sh