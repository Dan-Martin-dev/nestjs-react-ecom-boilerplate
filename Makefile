# ==============================================================================
# Streamlined Turborepo Ecom Monorepo Makefile
# ==============================================================================

# Define variables
DEV_COMPOSE_FILE = docker-compose.dev.yml
PROD_COMPOSE_FILE = docker-compose.prod.yml
COMPOSE_DEV = docker compose -f $(DEV_COMPOSE_FILE) --env-file=.env.dev
COMPOSE_PROD = docker compose -f $(PROD_COMPOSE_FILE) --env-file=.env.production

.DEFAULT_GOAL := help
.PHONY: help dev dev-docker dev-setup build-dev up-dev down-dev \
	prod-build prod-deploy prod-down prod-backup logs shell \
	db-generate db-migrate db-studio db-init clean health-check deploy

# ==============================================================================
# HELP
# ==============================================================================

help:
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Hybrid Development (Fast):"
	@echo "  dev               Start all apps on host with DB/Redis in Docker (fastest)"
	@echo "  dev-web           Run only frontend on host, API in Docker (fast web dev)"
	@echo "  dev-api           Run only backend on host, DB/Redis in Docker (fast API dev)"
	@echo ""
	@echo "Docker Development:"
	@echo "  dev-docker        Start full Docker development environment (all containers)"
	@echo "  dev-setup         One-time setup for development environment"
	@echo "  sync-deps         Sync dependencies after package.json changes"
	@echo ""
	@echo "Production:"
	@echo "  prod-build        Build production Docker images"
	@echo "  prod-deploy       Deploy to production with safety checks"
	@echo "  prod-down         Stop production services"
	@echo "  prod-backup       Backup production database"
	@echo ""
	@echo "Docker Management:"
	@echo "  up-dev            Start dev containers (detached)"
	@echo "  down-dev          Stop dev containers (preserves volumes/DB)"
	@echo "  logs [service]    Follow logs (all services or specific: api, web, db)"
	@echo "  shell [service]   Open shell in container (api or web)"
	@echo ""
	@echo "Database:"
	@echo "  db-generate       Generate Prisma client"
	@echo "  db-migrate        Run database migrations"
	@echo "  db-studio         Open Prisma Studio"
	@echo "  db-init           Initialize database and migrations"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean             Clean up Docker containers and images"
	@echo "  health-check      Check service health"
	@echo "  deploy            Trigger CI/CD deployment"
	@echo ""

# ==============================================================================
# DEVELOPMENT - HYBRID APPROACH (TURBOREPO + DOCKER)
# ==============================================================================

# Main development command - Hybrid mode (DB in Docker, apps on host)
dev:
	@echo "🚀 Starting hybrid development environment..."
	@echo "📊 Database and Redis in Docker, applications on host"
	$(COMPOSE_DEV) up -d db redis
	@sleep 3
	@echo "🔄 Generating Prisma client..."
	cd packages/db && pnpm db:generate
	@echo "🏗️ Building shared packages..."
	cd apps/api && pnpm build
	@echo "🚀 Starting all applications with Turborepo..."
	DOTENV_CONFIG_PATH=.env.dev pnpm turbo run dev


# Run just the frontend with backend services in Docker
dev-web:
	@echo "🚀 Starting frontend development environment..."
	@echo "📊 API, Database and Redis in Docker, web app on host"
	$(COMPOSE_DEV) up -d db redis api
	@sleep 5
	@echo "🚀 Starting web application..."
	cd apps/web && DOTENV_CONFIG_PATH=../../.env.dev pnpm dev


# Run just the backend with services in Docker
dev-api:
	@echo "🚀 Starting backend development environment..."
	@echo "📊 Database and Redis in Docker, API on host"
	$(COMPOSE_DEV) up -d db redis
	@sleep 3
	@echo "🔄 Generating Prisma client..."
	cd packages/db && pnpm db:generate
	@echo "🚀 Starting API application..."
	cd apps/api && DOTENV_CONFIG_PATH=../../.env.dev pnpm dev
# ...existing code...
build-dev:
	$(COMPOSE_DEV) build

up-dev:
	$(COMPOSE_DEV) up -d

# single-service safe restart targets
rebuild-restart-api:
	@echo "🔁 Rebuild and restart api (no deps, preserves volumes)..."
	$(COMPOSE_DEV) build api
	$(COMPOSE_DEV) up -d --no-deps --build api

rebuild-restart-web:
	@echo "🔁 Rebuild and restart web (no deps, preserves volumes)..."
	$(COMPOSE_DEV) build web
	$(COMPOSE_DEV) up -d --no-deps --build web

restart-api:
	@echo "♻️ Restart api container (no rebuild, no deps)..."
	$(COMPOSE_DEV) up -d --no-deps api

restart-web:
	@echo "♻️ Restart web container (no rebuild, no deps)..."
	$(COMPOSE_DEV) up -d --no-deps web

force-restart-api:
	@echo "⚠️ Force recreate api (rebuild + force recreate)..."
	$(COMPOSE_DEV) up -d --no-deps --build --force-recreate api

force-restart-web:
	@echo "⚠️ Force recreate web (rebuild + force recreate)..."
	$(COMPOSE_DEV) up -d --no-deps --build --force-recreate web

# restart multiple services without dependencies
restart-all-no-deps:
	@echo "♻️ Restart api and web (no deps)..."
	$(COMPOSE_DEV) up -d --no-deps api web

down-dev:	
	$(COMPOSE_DEV) down --remove-orphans

down-dev-v:
	$(COMPOSE_DEV) down -v --remove-orphans

# Docker-based development
docker-dev:
	@echo "🚀 Starting all containers in detached mode..."
	$(COMPOSE_DEV) up -d
	@echo ""
	@echo "🚀 Development environment is ready at:"
	@echo "┌───────────────────────────────────────────────────────────────┐"
	@echo "│ 🌐 Web Frontend:       http://localhost:$$(bash scripts/detect_ports.sh | grep WEB_PORT | cut -d= -f2)                  │"
	@echo "│ 🚀 API:               http://localhost:$$(bash scripts/detect_ports.sh | grep API_PORT | cut -d= -f2)/api/v1           │"
	@echo "│ 🗄️  Prisma Studio:     http://localhost:$$(bash scripts/detect_ports.sh | grep PRISMA_PORT | cut -d= -f2)                  │"
	@echo "└───────────────────────────────────────────────────────────────┘"

# Sync dependencies after package.json changes
sync-deps:
	@echo "🔄 Syncing dependencies in pnpm workspaces..."
	pnpm install
	@echo "📦 Syncing Docker volumes with current dependencies..."
	@echo "Tip: If you have node_modules issues in containers, rebuild the images:"
	@echo "  make rebuild-restart-web"
	@echo "  make rebuild-restart-api"


# One-time development setup
dev-setup:
	@echo "🔧 Setting up development environment..."
	@bash scripts/setup_dev.sh
	@echo "✅ Development setup complete! Run 'make dev' or 'make dev-docker'"


# ==============================================================================
# PRODUCTION
# ==============================================================================

prod-build:
	@echo "🔨 Building production images..."
	$(COMPOSE_PROD) build

prod-deploy:
	@echo "🚀 Deploying to production..."
	@make verify-env-prod
	$(COMPOSE_PROD) up --build -d
	@pnpm --filter @repo/db db:deploy
	@sleep 10
	@echo "✅ Production deployment complete!"

prod-down:
	@echo "🛑 Stopping production services..."
	$(COMPOSE_PROD) down --remove-orphans


prod-down-v:
	@echo "🛑 Stopping production services..."
	$(COMPOSE_PROD) down -v --remove-orphans

prod-backup:
	@echo "💾 Creating production database backup..."
	@mkdir -p ./backups
	@TIMESTAMP=$$(date +%Y%m%d%H%M%S); \
	docker exec monorepo-ecom-db-1 pg_dump -U $${POSTGRES_USER:-postgres} $${POSTGRES_DB:-monorepo-ecom} > ./backups/db-backup-$$TIMESTAMP.sql; \
	echo "✅ Backup saved: ./backups/db-backup-$$TIMESTAMP.sql"


# ==============================================================================
# DOCKER MANAGEMENT
.PHONY: api-dev web-dev down-dev-v docker-ui docker-web check-connections verify-env-prod

# Build dev Docker images
api-dev:
	$(COMPOSE_DEV) build api

web-dev:
	$(COMPOSE_DEV) build web
	
db-dev:
	$(COMPOSE_DEV) build db

redis-dev:
	$(COMPOSE_DEV) build redis

build-dev:
	$(COMPOSE_DEV) build

up-dev:
	$(COMPOSE_DEV) up -d

down-dev:	
	$(COMPOSE_DEV) down --remove-orphans

down-dev-v:
	$(COMPOSE_DEV) down -v --remove-orphans

# Flexible logging - usage: make logs [service=api]
logs:
	@$(COMPOSE_DEV) logs -f $(if $(service),$(service),)

shell:
	@if [ -z "$(service)" ]; then \
		echo "Usage: make shell service=api|web"; \
		exit 1; \
	fi
	@$(COMPOSE_DEV) exec $(service) bash
	
docker-ui:
	lazydocker

docker-web:
	@echo "Starting Dockge web UI..."
	@echo "Visit http://localhost:5001 for Docker Compose management"
	docker run -d --name dockge -p 5001:5001 -v /var/run/docker.sock:/var/run/docker.sock louislam/dockge

# ==============================================================================
# DATABASE

.PHONY: help dev dev-docker dev-setup build-dev up-dev down-dev \
    prod-build prod-deploy prod-down prod-backup logs shell \
    db-generate db-migrate db-studio db-init clean health-check deploy \
    api-dev web-dev down-dev-v docker-ui docker-web check-connections verify-env-prod

# ==============================================================================

db-generate:
	cd packages/db && pnpm db:generate

db-migrate:
	$(COMPOSE_DEV) exec api pnpm --filter @repo/db db:migrate

db-studio:
	$(COMPOSE_DEV) exec api pnpm --filter @repo/db db:studio

db-init:
	@echo "🗄️ Initializing database..."
	@bash scripts/init_db.sh

# ==============================================================================
# TROUBLESHOOTING HELPERS
# ==============================================================================

# Fix web node_modules without affecting the database
fix-web-modules:
	@echo "🔧 Fixing web modules without affecting the database..."
	@echo "1️⃣ Installing dependencies in monorepo root..."
	pnpm install
	@echo "2️⃣ Backing up any web volume node_modules if present..."
	@CONTAINER_ID=$$(docker ps -qf "name=.*-web-.*"); \
	if [ ! -z "$$CONTAINER_ID" ]; then \
		docker exec $$CONTAINER_ID sh -c "if [ -d /app/apps/web/node_modules ]; then ls -la /app/apps/web/node_modules | wc -l; fi"; \
	fi
	@echo "3️⃣ Rebuilding web container image..."
	$(COMPOSE_DEV) build web
	@echo "4️⃣ Force recreating web container with fresh image..."
	$(COMPOSE_DEV) up -d --force-recreate --no-deps web
	@echo "5️⃣ Checking web logs..."
	@sleep 3
	@$(COMPOSE_DEV) logs --tail=20 web
	@echo "✅ Web container rebuilt. Check make logs service=web for status"

# Find and list all Docker volumes
list-volumes:
	@echo "📦 Listing all Docker volumes..."
	@docker volume ls | grep monorepo-ecom || echo "No monorepo-ecom volumes found"
	
# Inspect web container 
inspect-web:
	@echo "🔍 Inspecting web container..."
	@CONTAINER_ID=$$(docker ps -qf "name=.*-web-.*"); \
	if [ -z "$$CONTAINER_ID" ]; then \
		echo "❌ Web container not running!"; \
	else \
		echo "✅ Web container found: $$CONTAINER_ID"; \
		echo "\n📂 Directory structure:"; \
		docker exec $$CONTAINER_ID find /app/apps/web -maxdepth 2 -type d | sort; \
		echo "\n📋 Node modules:"; \
		docker exec $$CONTAINER_ID sh -c "if [ -d /app/apps/web/node_modules ]; then ls -la /app/apps/web/node_modules/@mantinex || echo 'No @mantinex directory found'; fi"; \
	fi

# ==============================================================================
# MAINTENANCE
# ==============================================================================

clean: down-dev
	@echo "🧹 This will remove all unused Docker data including volumes!"
	@read -p "Proceed? (y/N): " confirm && [ "$$confirm" = "y" ] && docker system prune -a -f --volumes || echo "❌ Aborted"

check-connections:
	@echo "🔍 Checking connections between DB, API, and Frontend..."
	@bash scripts/check_connections.sh

health-check:
	@echo "🔍 Checking service health..."
	@curl -s http://localhost:3001/api/v1/health > /dev/null && echo "✅ API healthy" || echo "❌ API not responding"
	@docker ps --filter "name=monorepo-ecom" --format "table {{.Names}}\t{{.Status}}"

deploy:
	@command -v gh >/dev/null 2>&1 || { echo "❌ GitHub CLI (gh) not installed."; exit 1; }
	gh workflow run deploy.yml

# ==============================================================================
# INTERNAL HELPERS
# ==============================================================================

verify-env-prod:
	@test -f .env.production || { echo "❌ .env.production not found!"; exit 1; }
	@echo "✅ Production environment verified"