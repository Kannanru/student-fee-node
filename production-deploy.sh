#!/bin/bash

# Production Deployment Script for https://attendendance.askantech.com/
# Run this script on the production server

set -e  # Exit on any error

echo "🚀 Starting MGDC System Deployment to Production Server..."

# Configuration
APP_DIR="/var/www/mgdc-attendance"
NGINX_CONF="/etc/nginx/sites-available/attendendance.askantech.com"
DOMAIN="attendendance.askantech.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Don't run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Step 1: Install System Dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Install other dependencies
    sudo apt install -y git nginx mongodb-server certbot python3-certbot-nginx
    
    # Install PM2 globally
    sudo npm install -g pm2
    
    print_status "System dependencies installed successfully"
}

# Step 2: Setup Application Directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    # Create application directory
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    
    print_status "Application directory ready"
}

# Step 3: Clone and Setup Application
setup_application() {
    print_status "Setting up MGDC application..."
    
    cd "$APP_DIR"
    
    # Install backend dependencies
    npm install --production
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.production .env
        print_warning "Please edit .env file with your production values"
    fi
    
    print_status "Application dependencies installed"
}

# Step 4: Setup MongoDB
setup_mongodb() {
    print_status "Setting up MongoDB..."
    
    # Start and enable MongoDB
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
    
    # Create database user (you'll need to customize this)
    print_warning "Please create MongoDB user manually if needed"
    
    print_status "MongoDB setup complete"
}

# Step 5: Setup Nginx
setup_nginx() {
    print_status "Setting up Nginx reverse proxy..."
    
    # Copy nginx configuration
    sudo cp nginx.conf "$NGINX_CONF"
    
    # Enable site
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    
    # Remove default site if exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        print_status "Nginx configuration applied successfully"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Step 6: Setup SSL Certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Get SSL certificate
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
    
    if [ $? -eq 0 ]; then
        print_status "SSL certificate installed successfully"
    else
        print_warning "SSL certificate installation failed. You may need to configure it manually."
    fi
}

# Step 7: Start Application with PM2
start_application() {
    print_status "Starting application with PM2..."
    
    cd "$APP_DIR"
    
    # Start application
    pm2 start ecosystem.config.json
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    print_status "Application started successfully"
}

# Step 8: Setup Firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    # Enable UFW if not already enabled
    sudo ufw --force enable
    
    # Allow necessary ports
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 22
    sudo ufw allow 80
    sudo ufw allow 443
    
    print_status "Firewall configured"
}

# Step 9: Final Checks
run_final_checks() {
    print_status "Running final checks..."
    
    # Check if services are running
    if systemctl is-active --quiet nginx; then
        print_status "Nginx is running"
    else
        print_error "Nginx is not running"
    fi
    
    if systemctl is-active --quiet mongodb; then
        print_status "MongoDB is running"
    else
        print_error "MongoDB is not running"
    fi
    
    # Check PM2 processes
    pm2 status
    
    print_status "Final checks complete"
}

# Main deployment function
main() {
    echo "🎯 MGDC System Production Deployment"
    echo "======================================"
    echo "Domain: $DOMAIN"
    echo "App Directory: $APP_DIR"
    echo ""
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    install_dependencies
    setup_app_directory
    setup_application
    setup_mongodb
    setup_nginx
    setup_ssl
    start_application
    setup_firewall
    run_final_checks
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================="
    print_status "Frontend: https://$DOMAIN/"
    print_status "API: https://$DOMAIN/api/"
    print_status "Health Check: https://$DOMAIN/api/health"
    echo ""
    print_warning "Next Steps:"
    echo "1. Edit .env file with your production values"
    echo "2. Restart application: pm2 restart mgdc-backend"
    echo "3. Test all functionality"
    echo "4. Setup monitoring and backups"
    echo ""
    print_status "MGDC System is now live at https://$DOMAIN/ 🚀"
}

# Run main function
main "$@"