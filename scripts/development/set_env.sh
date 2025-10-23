#!/bin/bash

# Script to set the active environment by copying the appropriate .env file
# Usage: ./set_env.sh [dev|prod|test]

set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go to the parent directory (project root)
cd "$SCRIPT_DIR/.."

# Default to dev if no argument is provided
ENV="${1:-dev}"

case "$ENV" in
  dev|development)
    echo "Setting up development environment..."
    cp -v .env.dev .env
    echo "Environment set to development."
    ;;
    
  prod|production)
    echo "Setting up production environment..."
    cp -v .env.production .env
    echo "Environment set to production."
    ;;
    
  test)
    echo "Setting up test environment..."
    cp -v .env.test .env
    echo "Environment set to test."
    ;;
    
  *)
    echo "Error: Unknown environment '$ENV'"
    echo "Usage: $0 [dev|prod|test]"
    exit 1
    ;;
esac

echo ""
echo "You can now use docker compose with your selected environment."
echo "For development: docker compose -f docker-compose.dev.yml up -d"
echo "For production: docker compose -f docker-compose.prod.yml up -d"
