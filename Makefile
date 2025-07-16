# Turborepo Ecom Monorepo Makefile
# Best practices for Node.js, Docker, Prisma, CI/CD, and Ops

# Show help
help:
	@echo "\nTurborepo Ecom Monorepo Makefile"
	@echo "-----------------------------------"
	@echo "make install         # Install all dependencies"
	@echo "make prisma-generate # Generate Prisma client"
	@echo "make prisma-migrate  # Run database migrations"
	@echo "make build           # Build all apps and packages"
	@echo "make test            # Run all tests"
	@echo "make lint            # Lint all code"
	@echo "make dev             # Start dev servers (all apps)"
	@echo "make docker-dev      # Start Docker Compose for dev"
	@echo "make docker-prod     # Start Docker Compose for prod"
	@echo "make backup-db       # Run DB backup script"
	@echo "make docker-clean    # Clean up Docker containers/images"
	@echo "make deploy          # Trigger CI/CD pipeline"
	@echo "make help            # Show this help message\n"

.PHONY: install prisma-generate prisma-migrate build test lint dev docker-dev docker-prod backup-db docker-clean deploy help

# Install all dependencies
install:
	pnpm install

# Generate Prisma client
prisma-generate:
	pnpm --filter @repo/db db:generate

# Run database migrations
prisma-migrate:
	pnpm --filter @repo/db db:migrate

# Build all apps and packages
build:
	pnpm build

# Run all tests
test:
	pnpm test

# Lint all code
lint:
	pnpm lint

# Start development servers (all apps)
dev:
	pnpm turbo run dev

# Start Docker Compose for development
docker-dev:
	docker-compose -f docker-compose.dev.yml up --build

# Start Docker Compose for production
docker-prod:
	docker-compose --env-file .env.production -f docker-compose.prod.yml up --build -d

# Run database backup script
backup-db:
	bash scripts/backup.sh

# Clean up Docker containers and images
docker-clean:
	docker-compose down
	docker image prune -f

# Deploy (example: trigger CI/CD pipeline)
deploy:
	gh workflow run deploy.yml

