# Building Your Application Step-by-Step

This guide will walk you through fixing the connection issues and properly setting up your application for building and running.

## Step 1: Fix Environment Variables

I've already fixed your `.env.dev` file to correct the duplicate variables and database configuration.

Key changes:
- Fixed `POSTGRES_USER` duplicates
- Added proper `POSTGRES_PASSWORD` and `POSTGRES_DB`
- Fixed `DATABASE_URL` format
- Removed duplicate Redis configuration

## Step 2: Initialize Your Database

Run the following command to initialize your database and create the initial migrations:

```bash
make init-db
```

This will:
1. Start your database container
2. Generate the Prisma client
3. Create and apply initial migrations

## Step 3: Run the Connection Check Again

After initializing your database, run the connection check again to see if the issues are resolved:

```bash
make check-connections
```

If you still encounter issues, we'll need to fix them one by one.

## Step 4: Start Your Development Environment

Once all connection issues are fixed, you can start your full development environment:

```bash
make dev-all
```

This will start all your services:
- Database
- Redis
- API
- Frontend

## Step 5: Verify Your API

Check if your API is running and responding correctly:

```bash
curl http://localhost:3001/health
# or
curl http://localhost:3001/api/v1/health
```

## Step 6: Verify Your Frontend

Access your frontend application in a browser:
```
http://localhost:3000
```

## Troubleshooting Common Issues

### Database Connection Issues
If you're still having database connection problems:

1. Check your Docker containers:
   ```bash
   docker ps
   ```

2. Check the database logs:
   ```bash
   make logs-db
   ```

3. Try resetting the database:
   ```bash
   cd packages/db && pnpm prisma migrate reset --force
   ```

### API Not Starting
If your API container isn't starting properly:

1. Check the API logs:
   ```bash
   make logs-api
   ```

2. Verify the Dockerfile has the correct API development target:
   ```bash
   grep -A 10 "api-dev" Dockerfile
   ```

### Frontend Not Connecting to API
If your frontend can't connect to the API:

1. Verify the `VITE_API_URL` in `.env.dev` is set correctly
2. Check the CORS configuration in the API
3. Look for connection errors in your browser's developer console

## Building Your Application for Production

Once you've fixed all development issues, you can prepare for production:

```bash
make setup-env     # Set up production environment variables
make verify-env-prod     # Verify production configuration
make pre-deploy-check    # Run pre-deployment checks
make up-prod       # Deploy to production
```
