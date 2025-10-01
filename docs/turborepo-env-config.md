# Turborepo Environment Configuration

## Structure Overview

```
monorepo/
├── .env                    # Shared variables (database, secrets)
├── apps/
│   ├── api/
│   │   ├── .env           # API-specific variables (PORT, OAuth)
│   │   └── .env.example   # API env documentation
│   └── web/
│       ├── .env           # Web-specific variables (VITE_API_URL)
│       └── .env.example   # Web env documentation
└── .env.example           # Root env documentation
```

## Configuration Strategy

### Root `.env` - Shared Variables

- Database connections
- JWT secrets
- SMTP configuration
- Cloud service credentials
- Variables used by multiple apps/services

### App `.env` - App-Specific Variables

- **API**: PORT, CORS_ORIGIN, OAuth callbacks
- **Web**: VITE_API_URL, feature flags, public keys

## Benefits

1. **Clear Separation**: Each app manages its own configuration
2. **Independent Deployment**: Apps can be deployed with their own env files
3. **Reduced Conflicts**: No variable name collisions between apps
4. **Better Documentation**: App-specific examples are clearer
5. **Environment Flexibility**: Different environments can have different configs

## Usage

### Development

```bash
# Copy examples to create local env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Production

Each app gets deployed with its own environment variables through:

- Docker environment files
- Cloud platform environment variables
- Kubernetes secrets
- CI/CD pipeline variables

## Best Practices

1. **Never commit secrets** to version control
2. **Use .env.example files** to document required variables
3. **Keep shared variables** in root .env
4. **App-specific variables** in respective app .env files
5. **Use descriptive names** with app prefixes when needed
6. **Validate environment** variables at startup
