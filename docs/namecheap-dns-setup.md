# Setting Up Your Namecheap Domain for Hetzner Hosting

This guide will walk you through the process of configuring your Namecheap domain to point to your Hetzner Cloud server.

## Prerequisites

- A domain purchased from Namecheap
- A Hetzner Cloud server instance
- Your Hetzner server IP address

## Step 1: Access Namecheap Domain Management

1. Log in to your Namecheap account
2. Go to "Domain List" from your dashboard
3. Find your domain and click "Manage"

## Step 2: Navigate to DNS Settings

1. Click on the "Advanced DNS" tab
2. You should see the "Host Records" section

## Step 3: Configure A Records

You'll need to create several A records to point your domain and subdomains to your Hetzner server IP.

Add the following A records:

1. **Root Domain**
   - Host: `@`
   - Value: `YOUR_HETZNER_IP` (e.g., 78.45.123.456)
   - TTL: Automatic

2. **API Subdomain**
   - Host: `api`
   - Value: `YOUR_HETZNER_IP`
   - TTL: Automatic

3. **Monitoring Subdomains**
   - Host: `grafana`
   - Value: `YOUR_HETZNER_IP`
   - TTL: Automatic
   
   - Host: `prometheus`
   - Value: `YOUR_HETZNER_IP`
   - TTL: Automatic
   
   - Host: `alerts`
   - Value: `YOUR_HETZNER_IP`
   - TTL: Automatic

## Step 4: Configure WWW Redirect (Optional)

If you want www.yourdomain.com to redirect to yourdomain.com:

1. Find the "Redirect Domain" section in Namecheap
2. Set up a redirect from www.yourdomain.com to yourdomain.com

## Step 5: Wait for DNS Propagation

DNS changes can take anywhere from a few minutes to 48 hours to propagate globally.

You can check if your DNS settings are propagated using:

```bash
nslookup yourdomain.com
nslookup api.yourdomain.com
```

## Step 6: Verify SSL Certificate Setup

After deploying your application, verify that SSL certificates are properly issued:

1. Open your browser and navigate to https://yourdomain.com
2. Check that the connection is secure (look for the padlock icon)
3. Repeat for https://api.yourdomain.com and https://grafana.yourdomain.com

## Troubleshooting

- **SSL Certificate Issues**: If Let's Encrypt fails to issue certificates, ensure your domain is correctly pointing to your Hetzner IP and that ports 80 and 443 are open.

- **Domain Not Resolving**: Double-check your A records in Namecheap and ensure you've entered the correct Hetzner IP address.

- **Subdomains Not Working**: Make sure you've created A records for each required subdomain.

- **Traefik Errors**: If Traefik fails to obtain certificates, check the logs with `make logs-prod` and look for any Let's Encrypt related errors.
