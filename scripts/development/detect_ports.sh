#!/bin/bash
# Script to detect service ports for URLs in development environment

# Function to extract port from docker-compose
get_port_from_compose() {
  service=$1
  # Extract the port mapping for the service
  port=$(grep -A 10 "  $service:" docker-compose.dev.yml | grep -E "ports:" -A 2 | grep -oE "[0-9]+:[0-9]+" | head -1 | cut -d ':' -f 1)
  echo "$port"
}

# Function to extract port from Vite config
get_vite_dev_port() {
  # If vite.config.ts specifies a port, use it
  if [ -f "apps/web/vite.config.ts" ]; then
    port=$(grep -E "port.*[0-9]+" apps/web/vite.config.ts | grep -oE "[0-9]+" | head -1)
    if [ -n "$port" ]; then
      echo "$port"
      return
    fi
  fi
  
  # Default Vite port is 5173 if not specified
  echo "5173"
}

# Function to extract port from environment file
get_port_from_env() {
  var_name=$1
  default=$2
  
  # Try to extract from .env.dev
  if [ -f ".env.dev" ]; then
    value=$(grep -E "^$var_name=" .env.dev | cut -d '=' -f 2 | tr -d '"' | tr -d "'")
    if [ -n "$value" ]; then
      echo "$value"
      return
    fi
  fi
  
  # Return default if not found
  echo "$default"
}

# Determine web frontend port
# First check Docker Compose mapping
WEB_PORT=$(get_port_from_compose "web")
if [ -z "$WEB_PORT" ] || [ "$WEB_PORT" = "3000" ]; then
  # If not found or is the default, check for Vite specific config
  WEB_PORT=$(get_vite_dev_port)
fi

# Determine API port from env or use default
API_PORT=$(get_port_from_env "PORT" "3001")

# Determine Prisma Studio port (default is 5555)
PRISMA_PORT="5555"

# Determine Traefik dashboard port
TRAEFIK_PORT="8080"

# Output the results in a format that can be sourced by the Makefile
echo "WEB_PORT=$WEB_PORT"
echo "API_PORT=$API_PORT"
echo "PRISMA_PORT=$PRISMA_PORT"
echo "TRAEFIK_PORT=$TRAEFIK_PORT"
