#!/bin/bash
# Server setup script for Hetzner Cloud
# This script sets up a new Ubuntu server for the nestjs-reactjs-ecom-boilerplate ecommerce application

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting Hetzner Server Setup ===${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install essential packages
echo -e "${YELLOW}Installing essential packages...${NC}"
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    unzip \
    jq

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Configure Docker
echo -e "${YELLOW}Configuring Docker...${NC}"
systemctl enable docker
systemctl start docker

# Setup firewall
echo -e "${YELLOW}Setting up firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 5432/tcp # PostgreSQL (optional, for direct access)
ufw --force enable

# Configure fail2ban
echo -e "${YELLOW}Configuring fail2ban...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# Create deployment directory
echo -e "${YELLOW}Creating deployment directory...${NC}"
mkdir -p /opt/nestjs-reactjs-ecom-boilerplate-ecom/{backups,data,logs}
chown -R 1001:1001 /opt/nestjs-reactjs-ecom-boilerplate-ecom # Match UID from Dockerfile

# Setup automatic security updates
echo -e "${YELLOW}Setting up automatic security updates...${NC}"
apt-get install -y unattended-upgrades
cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}:\${distro_codename}-updates";
};
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
EOF

# Enable automatic updates
echo 'APT::Periodic::Update-Package-Lists "1";' > /etc/apt/apt.conf.d/20auto-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' >> /etc/apt/apt.conf.d/20auto-upgrades

# Setup log rotation
echo -e "${YELLOW}Setting up log rotation...${NC}"
cat > /etc/logrotate.d/docker-containers << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF

# System information
# Setup log monitoring with logwatch
echo -e "${YELLOW}Setting up log monitoring...${NC}"
apt-get install -y logwatch
echo "MailTo = root" > /etc/logwatch/conf/logwatch.conf
echo "MailFrom = logwatch@$(hostname -f)" >> /etc/logwatch/conf/logwatch.conf
echo "Range = yesterday" >> /etc/logwatch/conf/logwatch.conf
echo "Detail = Medium" >> /etc/logwatch/conf/logwatch.conf
echo "Service = All" >> /etc/logwatch/conf/logwatch.conf

# Set up mail forwarding for the root user
echo "root: your-external-email@example.com" >> /etc/aliases
newaliases

# Setup automatic security scanning
echo -e "${YELLOW}Setting up security scanning...${NC}"
apt-get install -y rkhunter lynis clamav
# Schedule weekly security scans
cat > /etc/cron.weekly/security-scan << EOF
#!/bin/bash
echo "Running security scan at \$(date)"
rkhunter --update
rkhunter --check --skip-keypress --quiet
lynis audit system --quick
freshclam
clamscan --recursive --infected /home
EOF
chmod +x /etc/cron.weekly/security-scan

echo -e "${GREEN}=== Server Setup Complete ===${NC}"
echo -e "${YELLOW}System Information:${NC}"
echo "CPU: $(grep -c processor /proc/cpuinfo) cores"
echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $2}')"
echo "IP: $(curl -s ifconfig.me)"

echo -e "${GREEN}The server is now ready for deployment.${NC}"
echo -e "${YELLOW}Next step: Run the deployment script from your local machine.${NC}"
