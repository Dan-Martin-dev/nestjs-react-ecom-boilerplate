#!/bin/bash
# Production readiness validation script
# This script validates that all components are ready for production deployment

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}=== PRODUCTION READINESS VALIDATION ===${NC}"
echo ""

# Function to run test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✓${NC} $description: $file_path"
        return 0
    else
        echo -e "${RED}✗${NC} $description: $file_path (missing)"
        return 1
    fi
}

echo -e "${YELLOW}1. Checking essential files...${NC}"
check_file "Dockerfile" "Docker configuration"
check_file "docker-compose.dev.yml" "Development Docker Compose"
check_file "docker-compose.prod.yml" "Production Docker Compose"
check_file ".env.production" "Production environment template"
check_file "nginx.conf" "Nginx configuration"
check_file "packages/db/schema.prisma" "Database schema"
echo ""

echo -e "${YELLOW}2. Validating Docker configurations...${NC}"
run_test "Docker Compose dev syntax" "docker compose -f docker-compose.dev.yml config --quiet"
run_test "Docker Compose prod syntax" "docker compose -f docker-compose.prod.yml config --quiet"
echo ""

echo -e "${YELLOW}3. Testing build processes...${NC}"
run_test "TypeScript compilation" "pnpm run build"
run_test "API Docker image build" "docker build --target api -t test-api-prod . --quiet"
run_test "Web Docker image build" "docker build --target web -t test-web-prod . --quiet"
echo ""

echo -e "${YELLOW}4. Checking package dependencies...${NC}"
run_test "Package lock file integrity" "pnpm install --frozen-lockfile --offline"
run_test "Security audit" "pnpm audit --audit-level moderate"
echo ""

echo -e "${YELLOW}5. Validating database setup...${NC}"
run_test "Prisma schema validation" "cd packages/db && npx prisma validate"
run_test "Prisma client generation" "cd packages/db && npx prisma generate"
echo ""

echo -e "${YELLOW}6. Testing development environment...${NC}"
echo "Starting development containers (this may take a moment)..."
if docker compose -f docker-compose.dev.yml up -d > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Development containers started"
    
    # Wait for services to be ready
    sleep 10
    
    # Test API health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} API health check passed"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} API health check failed"
        ((TESTS_FAILED++))
    fi
    
    # Test Web app
    if curl -f http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Web app accessibility test passed"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} Web app accessibility test failed"
        ((TESTS_FAILED++))
    fi
    
    # Stop containers
    docker compose -f docker-compose.dev.yml down > /dev/null 2>&1
    echo -e "${GREEN}✓${NC} Development containers stopped"
else
    echo -e "${RED}✗${NC} Failed to start development containers"
    ((TESTS_FAILED++))
fi
echo ""

echo -e "${YELLOW}7. Checking production deployment scripts...${NC}"
check_file "scripts/deploy_to_hetzner.sh" "Hetzner deployment script"
check_file "scripts/server_setup.sh" "Server setup script"
check_file "scripts/backup.sh" "Database backup script"
check_file "scripts/health_check.sh" "Health check script"
echo ""

echo -e "${YELLOW}8. Validating environment configurations...${NC}"
# Check if essential environment variables are defined in production template
if grep -q "DATABASE_URL=" .env.production; then
    echo -e "${GREEN}✓${NC} Database URL configured"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Database URL not configured"
    ((TESTS_FAILED++))
fi

if grep -q "JWT_SECRET=" .env.production; then
    echo -e "${GREEN}✓${NC} JWT secrets configured"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} JWT secrets not configured"
    ((TESTS_FAILED++))
fi

if grep -q "DOMAIN=" .env.production; then
    echo -e "${GREEN}✓${NC} Domain configuration present"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Domain not configured"
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}=== VALIDATION SUMMARY ===${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your application is production-ready.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps for deployment:${NC}"
    echo "1. Update .env.production with your actual domain and server IP"
    echo "2. Run: bash scripts/server_setup.sh (on your Hetzner server)"
    echo "3. Run: bash scripts/deploy_to_hetzner.sh (from local machine)"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues before deploying to production.${NC}"
    echo ""
    exit 1
fi
