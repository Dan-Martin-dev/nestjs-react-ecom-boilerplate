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
	@echo "Development:"
	@echo "  dev               Start local development (non-Docker)"
	@echo "  dev-docker        Start full Docker development environment"
	@echo "  dev-setup         One-time setup for development environment"
	@echo ""
	@echo "Production:"
	@echo "  prod-build        Build production Docker images"
	@echo "  prod-deploy       Deploy to production with safety checks"
	@echo "  prod-down         Stop production services"
	@echo "  prod-backup       Backup production database"
	@echo ""
	@echo "Docker Management:"
	@echo "  up-dev            Start dev containers (detached)"
	@echo "  down-dev          Stop dev containers"
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
# DEVELOPMENT
# ==============================================================================

# Main development command - non-Docker
dev:
	@echo "🚀 Starting local development environment..."
	$(COMPOSE_DEV) up -d db redis
	@sleep 3
	cd packages/db && pnpm db:generate
	cd apps/api && pnpm build
	DOTENV_CONFIG_PATH=.env.dev pnpm turbo run dev

# Docker-based development
dev-docker:
	@echo "🚀 Starting all containers in detached mode..."
	$(COMPOSE_DEV) up -d
	@echo ""
	@echo "🚀 Development environment is ready at:"
	@echo "┌───────────────────────────────────────────────────────────────┐"
	@echo "│ 🌐 Web Frontend:       http://localhost:$$(bash scripts/detect_ports.sh | grep WEB_PORT | cut -d= -f2)                  │"
	@echo "│ 🚀 API:               http://localhost:$$(bash scripts/detect_ports.sh | grep API_PORT | cut -d= -f2)/api/v1           │"
	@echo "│ 🗄️  Prisma Studio:     http://localhost:$$(bash scripts/detect_ports.sh | grep PRISMA_PORT | cut -d= -f2)                  │"
	@echo "└───────────────────────────────────────────────────────────────┘"



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
	$(COMPOSE_PROD) down -v --remove-orphans

prod-backup:
	@echo "💾 Creating production database backup..."
	@mkdir -p ./backups
	@TIMESTAMP=$$(date +%Y%m%d%H%M%S); \
	docker exec monorepo-ecom-db-1 pg_dump -U $${POSTGRES_USER:-postgres} $${POSTGRES_DB:-monorepo-ecom} > ./backups/db-backup-$$TIMESTAMP.sql; \
	echo "✅ Backup saved: ./backups/db-backup-$$TIMESTAMP.sql"

# ==============================================================================
# DOCKER MANAGEMENT
# Build dev Docker images
api-dev:
	$(COMPOSE_DEV) build api

web-dev:
	$(COMPOSE_DEV) build web

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
	@if [ -n "$(service)" ]; then \
		$(COMPOSE_DEV) logs -f $(service); \
	else \
		$(COMPOSE_DEV) logs -f; \
	fi

# Flexible shell access - usage: make shell service=api
shell:
	@if [ -z "$(service)" ]; then \
		echo "Usage: make shell service=api|web"; \
		exit 1; \
	fi
	$(COMPOSE_DEV) exec $(service) bash
	
docker-ui:
	lazydocker

docker-web:
	@echo "Starting Dockge web UI..."
	@echo "Visit http://localhost:5001 for Docker Compose management"
	docker run -d --name dockge -p 5001:5001 -v /var/run/docker.sock:/var/run/docker.sock louislam/dockge

# ==============================================================================
# DATABASE

.PHONY: db-migrate db-studio
# ==============================================================================

db-generate:
	cd packages/db && pnpm db:generate

db-migrate:
	docker-compose -f docker-compose.dev.yml exec api pnpm --filter @repo/db db:migrate

db-studio:
	docker-compose -f docker-compose.dev.yml exec api pnpm --filter @repo/db db:studio

db-init:
	@echo "🗄️ Initializing database..."
	@bash scripts/init_db.sh

# ==============================================================================
# MAINTENANCE
# ==============================================================================

clean: down-dev
	@echo "🧹 Cleaning up Docker resources..."
	docker system prune -a -f --volumes

check-connections:
	@echo "🔍 Checking connections between DB, API, and Frontend..."
	@bash scripts/check_connections.sh

health-check:
	@echo "🔍 Checking service health..."
	@curl -s http://localhost:3001/api/v1/health > /dev/null && echo "✅ API healthy" || echo "❌ API not responding"
	@docker ps --filter "name=monorepo-ecom" --format "table {{.Names}}\t{{.Status}}"

deploy:
	gh workflow run deploy.yml

# ==============================================================================
# INTERNAL HELPERS
# ==============================================================================

verify-env-prod:
	@test -f .env.production || { echo "❌ .env.production not found!"; exit 1; }
	@echo "✅ Production environment verified"