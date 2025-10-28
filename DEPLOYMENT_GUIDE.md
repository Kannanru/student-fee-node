# MGDC Fee Management System - Production Deployment Guide

## Server: https://attendendance.askantech.com/

### Prerequisites

1. **Server Requirements:**
   - Ubuntu 20.04 LTS or higher
   - Node.js 18+ 
   - MongoDB 6.0+
   - Nginx (for reverse proxy)
   - PM2 (for process management)
   - Git

2. **Domain & SSL:**
   - Domain: attendendance.askantech.com
   - SSL Certificate configured

### Deployment Steps

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Clone Repository

```bash
# Navigate to web directory
cd /var/www/html

# Clone the repository
sudo git clone https://github.com/Kannanru/student-fee-node.git mgdc-fees
sudo chown -R $USER:$USER mgdc-fees
cd mgdc-fees
```

#### 3. Environment Configuration

```bash
# Copy and configure production environment
cd backend
cp .env.production .env

# Edit environment variables
nano .env
```

**Update the following in .env:**
```
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/mgdc_fees_production
JWT_SECRET=your-super-secure-jwt-secret-key-here
PORT=5000
HOST=0.0.0.0
```

#### 4. Install Dependencies & Build

```bash
# Install backend dependencies
cd backend
npm ci --only=production

# Install frontend dependencies and build
cd ../frontend
npm ci
npm run build --prod

# Copy built frontend to backend
cp -r dist/mgdc-admin-frontend/* ../backend/public/
```

#### 5. Database Setup

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and seed data (optional)
cd ../backend
npm run seed
```

#### 6. Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.json --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 7. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp ../nginx.conf /etc/nginx/sites-available/mgdc-fees
sudo ln -s /etc/nginx/sites-available/mgdc-fees /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 8. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d attendendance.askantech.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Monitoring & Maintenance

#### Check Application Status
```bash
pm2 status
pm2 logs mgdc-fees
```

#### Check System Services
```bash
sudo systemctl status mongod
sudo systemctl status nginx
```

#### Update Application
```bash
cd /var/www/html/mgdc-fees
git pull origin main
npm run deploy  # Will run the deploy.sh script
```

### Backup & Recovery

#### Database Backup
```bash
# Create backup
mongodump --db mgdc_fees_production --out /backup/mongodb/$(date +%Y%m%d)

# Restore backup
mongorestore --db mgdc_fees_production /backup/mongodb/YYYYMMDD/mgdc_fees_production
```

#### File Backup
```bash
# Backup uploads
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/www/html/mgdc-fees/backend/uploads
```

### Troubleshooting

#### Common Issues

1. **Application not starting:**
   ```bash
   pm2 logs mgdc-fees
   pm2 restart mgdc-fees
   ```

2. **Database connection issues:**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **Nginx issues:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Check logs:**
   ```bash
   # Application logs
   pm2 logs mgdc-fees
   
   # Nginx logs
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Performance Optimization

1. **Enable compression in Nginx**
2. **Setup CDN for static assets**
3. **Database indexing**
4. **Enable HTTP/2**
5. **Setup monitoring with tools like New Relic or DataDog**

### Security Checklist

- ✅ SSL/TLS enabled
- ✅ Rate limiting configured
- ✅ Security headers set
- ✅ Environment variables secured
- ✅ Database access restricted
- ✅ Regular security updates
- ✅ Firewall configured

### Support

For issues or questions:
- Check logs first
- Review this documentation
- Contact system administrator

---

**Last Updated:** October 28, 2025
**Version:** 1.0.0