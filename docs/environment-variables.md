# Environment Variables Structure

This document outlines the environment variable structure for the project.

## Overview

The project uses a layered approach to environment variables:

1. **Root level**: Shared variables used by multiple applications/services
2. **App level**: App-specific variables used only within that application

## File Structure

### Root Level

- `.env` - Shared variables for local development
- `.env.example` - Example of shared variables
- `.env.dev.example` - Example for development environment
- `.env.production.example` - Example for production environment

### API Application

- `apps/api/.env` - API-specific variables for local development
- `apps/api/.env.example` - Example of API-specific variables

### Web Application

- `apps/web/.env` - Web-specific variables for local development
- `apps/web/.env.example` - Example of Web-specific variables

## Environment Variables Loading

- **API (NestJS)**: Uses dotenv to load `.env` files (root + apps/api)
- **Web (Vite/React)**: Vite automatically loads `.env` files with `VITE_` prefix (apps/web)

## Best Practices

1. Never commit real environment files to Git
2. Always update the example files when adding new environment variables
3. Keep app-specific variables in their respective app directories
4. Use the root `.env` file only for truly shared variables
5. Prefix all frontend variables with `VITE_` to make them accessible in the browser

## Production Deployment

For production deployment:

- Use the `.env.production.example` as a template
- Set environment variables through your deployment platform or Docker
