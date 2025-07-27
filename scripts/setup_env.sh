#!/bin/bash
# Setup script to help with environment variable configuration
# Run this script to set up your production environment

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/vare/project/ecom_101/monorepo-ecom"
ENV_FILE="$PROJECT_DIR/.env.production"
ENV_TEMPLATE="$PROJECT_DIR/.env.production.example"

echo -e "${GREEN}=== Setting up your production environment ===${NC}"

# Check if template exists
if [ ! -f "$ENV_TEMPLATE" ]; then
  echo -e "${RED}Error: Template file $ENV_TEMPLATE not found${NC}"
  exit 1
fi

# Copy template if .env.production doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}Creating .env.production file from template...${NC}"
  cp "$ENV_TEMPLATE" "$ENV_FILE"
  echo -e "${GREEN}Created $ENV_FILE${NC}"
else
  echo -e "${YELLOW}Warning: $ENV_FILE already exists. Will update existing file.${NC}"
fi

# Function to prompt for a value with a default
prompt_value() {
  local message="$1"
  local var_name="$2"
  local default_value="$3"
  local is_secret="$4"
  
  local current_value=""
  if grep -q "^$var_name=" "$ENV_FILE"; then
    current_value=$(grep "^$var_name=" "$ENV_FILE" | cut -d '=' -f2)
  fi
  
  if [ -n "$current_value" ] && [ "$current_value" != "$default_value" ]; then
    default_value="$current_value"
  fi
  
  local prompt_message="${YELLOW}$message${NC}"
  if [ -n "$default_value" ] && [ "$default_value" != "generate" ]; then
    prompt_message="$prompt_message [${GREEN}$default_value${NC}]"
  fi
  prompt_message="$prompt_message: "
  
  local input=""
  if [ "$is_secret" == "true" ]; then
    echo -en "$prompt_message"
    read -s input
    echo ""  # Add a newline after the hidden input
  else
    echo -en "$prompt_message"
    read input
  fi
  
  if [ -z "$input" ]; then
    input="$default_value"
  fi
  
  # Handle special "generate" default value
  if [ "$input" == "generate" ]; then
    input=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
    echo -e "Generated value: ${GREEN}$input${NC}"
  fi
  
  # Update the .env.production file
  if grep -q "^$var_name=" "$ENV_FILE"; then
    sed -i "s|^$var_name=.*|$var_name=$input|" "$ENV_FILE"
  else
    echo "$var_name=$input" >> "$ENV_FILE"
  fi
}

# Generate secure password
generate_password() {
  openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16
}

echo -e "\n${GREEN}=== Domain Configuration ===${NC}"
prompt_value "Enter your Namecheap domain" "DOMAIN" "yourdomain.com" "false"
prompt_value "Enter your email address (for SSL certificates)" "ACME_EMAIL" "" "false"

echo -e "\n${GREEN}=== Database Configuration ===${NC}"
prompt_value "Enter database username" "POSTGRES_USER" "monorepo-ecom-admin" "false"
password=$(generate_password)
prompt_value "Enter database password" "POSTGRES_PASSWORD" "$password" "true"
prompt_value "Enter database name" "POSTGRES_DB" "monorepo-ecom" "false"

echo -e "\n${GREEN}=== Security Configuration ===${NC}"
jwt_secret=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
prompt_value "Enter JWT secret" "JWT_SECRET" "$jwt_secret" "true"
jwt_refresh=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
prompt_value "Enter JWT refresh secret" "JWT_REFRESH_SECRET" "$jwt_refresh" "true"
prompt_value "Enter bcrypt salt rounds" "BCRYPT_SALT_ROUNDS" "12" "false"

echo -e "\n${GREEN}=== Monitoring Configuration ===${NC}"
grafana_pwd=$(generate_password)
prompt_value "Enter Grafana admin password" "GRAFANA_PASSWORD" "$grafana_pwd" "true"
prompt_value "Enter notification email" "NOTIFICATION_EMAIL" "" "false"

echo -e "\n${GREEN}=== Hetzner Server Configuration ===${NC}"
prompt_value "Enter your Hetzner Server IP" "HETZNER_SERVER_IP" "" "false"

echo -e "\n${GREEN}=== SMTP Configuration (Optional) ===${NC}"
prompt_value "Enter SMTP username (leave empty to skip)" "SMTP_USER" "" "false"
prompt_value "Enter SMTP password (leave empty to skip)" "SMTP_PASS" "" "true"

echo -e "\n${GREEN}=== S3 Backup Configuration (Optional) ===${NC}"
prompt_value "Enter S3 bucket name (leave empty to skip)" "S3_BACKUP_BUCKET" "" "false"
if grep -q "^S3_BACKUP_BUCKET=" "$ENV_FILE" && [ -n "$(grep "^S3_BACKUP_BUCKET=" "$ENV_FILE" | cut -d '=' -f2)" ]; then
  prompt_value "Enter AWS access key ID" "AWS_ACCESS_KEY_ID" "" "false"
  prompt_value "Enter AWS secret access key" "AWS_SECRET_ACCESS_KEY" "" "true"
fi

# Set up DATABASE_URL using the entered credentials
db_user=$(grep "^POSTGRES_USER=" "$ENV_FILE" | cut -d '=' -f2)
db_pass=$(grep "^POSTGRES_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2)
db_name=$(grep "^POSTGRES_DB=" "$ENV_FILE" | cut -d '=' -f2)
domain=$(grep "^DOMAIN=" "$ENV_FILE" | cut -d '=' -f2)

# Update derived values
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${db_user}:${db_pass}@db:5432/${db_name}?connection_limit=20\&pool_timeout=20|" "$ENV_FILE"
sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=https://${domain}|" "$ENV_FILE"

echo -e "\n${GREEN}=== Environment Configuration Complete! ===${NC}"
echo -e "Your production environment file has been created at: ${YELLOW}$ENV_FILE${NC}"
echo -e "\nNext steps:"
echo -e "1. ${YELLOW}Set up DNS for your domain${NC} at Namecheap:"
echo -e "   - Create A record: @ → $(grep "^HETZNER_SERVER_IP=" "$ENV_FILE" | cut -d '=' -f2)"
echo -e "   - Create A record: api → $(grep "^HETZNER_SERVER_IP=" "$ENV_FILE" | cut -d '=' -f2)"
echo -e "   - Create A record: grafana → $(grep "^HETZNER_SERVER_IP=" "$ENV_FILE" | cut -d '=' -f2)"
echo -e "2. ${YELLOW}Verify your environment configuration${NC}:"
echo -e "   cd $PROJECT_DIR && make verify-env-prod"
echo -e "3. ${YELLOW}Build and test your application${NC}:"
echo -e "   cd $PROJECT_DIR && make pre-deploy-check"
echo -e "4. ${YELLOW}Deploy to your Hetzner server${NC}:"
echo -e "   cd $PROJECT_DIR && make deploy"
echo -e ""
