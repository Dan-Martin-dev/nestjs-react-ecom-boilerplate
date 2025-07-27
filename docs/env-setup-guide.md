# Step-by-Step Guide for Setting Up Your Production Environment

This guide will help you set up all the required environment variables for your Hetzner Cloud deployment with your Namecheap domain.

## 1. Create Your Production Environment File

First, let's create the production environment file:

```bash
cd /home/vare/project/ecom_101/monorepo-ecom
cp .env.production.example .env.production
```

## 2. Basic Domain Configuration

Open the `.env.production` file and update these variables:

```bash
# Your Namecheap domain
DOMAIN=yourdomain.com
# Your email address (used for SSL certificates)
ACME_EMAIL=your-email@example.com
```

## 3. Database Configuration

Generate secure passwords for your database:

```bash
# Generate a secure password
openssl rand -base64 32
```

Then update these variables:

```bash
POSTGRES_USER=monorepo-ecom-admin
POSTGRES_PASSWORD=paste-generated-password-here
POSTGRES_DB=monorepo-ecom
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?connection_limit=20&pool_timeout=20
```

## 4. API Security Configuration

Generate JWT secrets:

```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

Update these variables:

```bash
JWT_SECRET=first-generated-secret
JWT_REFRESH_SECRET=second-generated-secret
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=https://${DOMAIN}
```

## 5. Monitoring Configuration

Generate a basic auth password for Prometheus:

```bash
# Install htpasswd if needed
sudo apt-get install apache2-utils
# Generate the hash (replace 'yourpassword' with a secure password)
htpasswd -nbB admin yourpassword
```

Update these variables:

```bash
# Copy the output from htpasswd command
PROMETHEUS_BASIC_AUTH=admin:$apr1$hash_value_from_command
GRAFANA_PASSWORD=another-secure-password
NOTIFICATION_EMAIL=your-email@example.com
```

## 6. SMTP Configuration (Optional for Email Alerts)

If you want email alerts, sign up for a free SMTP service like SendGrid or Mailgun and update:

```bash
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

## 7. Slack Notifications (Optional)

If you use Slack and want notifications:
1. Create a Slack app at https://api.slack.com/apps
2. Create a webhook URL
3. Add this variable:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
```

## 8. Hetzner Server Information

After creating your Hetzner server, update:

```bash
HETZNER_SERVER_IP=your-server-ip
```

## 9. Optional Backup Configuration

For offsite backups (recommended), create an AWS S3 bucket or use another S3-compatible service:

```bash
S3_BACKUP_BUCKET=your-backup-bucket-name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

## 10. Test Your Configuration

After setting up all variables, run:

```bash
cd /home/vare/project/ecom_101/monorepo-ecom
make verify-env-prod
```

This will check if all required variables are properly set.
