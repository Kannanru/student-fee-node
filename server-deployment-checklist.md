# Server Deployment Checklist for https://attendendance.askantech.com/

## ✅ Pre-Deployment Preparation Complete

### Frontend Build Status
- ✅ Angular production build completed successfully
- ✅ Build location: `frontend/dist/mgdc-admin-frontend`
- ✅ Bundle size: 629.76 kB (163.78 kB compressed)
- ✅ Production environment configured for https://attendendance.askantech.com/api

### Backend Configuration
- ✅ Server configured for production domain
- ✅ CORS updated for https://attendendance.askantech.com/
- ✅ Static file serving configured
- ✅ Production environment variables template ready

### Deployment Infrastructure
- ✅ Docker configurations ready (Dockerfile, docker-compose.yml)
- ✅ Nginx reverse proxy configuration
- ✅ PM2 process management setup
- ✅ Automated deployment script (deploy.sh)
- ✅ Environment variables template (.env.production)

## 🚀 Server Deployment Steps

### Step 1: Server Prerequisites
```bash
# On the production server (https://attendendance.askantech.com/)
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git nginx mongodb-server certbot
sudo npm install -g pm2
```

### Step 2: Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/mgdc-attendance.git
sudo chown -R $USER:$USER mgdc-attendance
cd mgdc-attendance
```

### Step 3: Configure Environment
```bash
# Copy and customize environment variables
cp .env.production .env
# Edit .env with actual production values:
# - MongoDB connection string
# - JWT secrets
# - API keys
nano .env
```

### Step 4: Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies (if rebuilding on server)
cd frontend
npm install
cd ..
```

### Step 5: Deploy Application
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Step 6: Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/attendendance.askantech.com
sudo ln -s /etc/nginx/sites-available/attendendance.askantech.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d attendendance.askantech.com
```

### Step 8: Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

## 🔍 Post-Deployment Verification

### Check Application Status
```bash
# PM2 process status
pm2 status

# Application logs
pm2 logs mgdc-backend

# Nginx status
sudo systemctl status nginx

# MongoDB status
sudo systemctl status mongodb
```

### Test Endpoints
- Frontend: https://attendendance.askantech.com/
- API Health: https://attendendance.askantech.com/api/health
- Login Test: https://attendendance.askantech.com/api/auth/login
- Fee Reports: https://attendendance.askantech.com/fee-reports

### Performance Checks
- Frontend loading speed
- API response times
- Fee reports date range functionality
- Export features

## 📁 Files Ready for Upload

### Core Application Files
- `/backend/` - Complete backend with production config
- `/frontend/dist/mgdc-admin-frontend/` - Built frontend assets
- `ecosystem.config.json` - PM2 configuration
- `deploy.sh` - Deployment automation
- `.env.production` - Environment template

### Configuration Files
- `nginx.conf` - Nginx reverse proxy
- `Dockerfile` - Container deployment
- `docker-compose.yml` - Multi-service setup
- `DEPLOYMENT_GUIDE.md` - Detailed instructions

## 🔧 Troubleshooting

### Common Issues
1. **Port conflicts**: Check if port 5000 is available
2. **MongoDB connection**: Verify connection string in .env
3. **CORS errors**: Ensure domain matches in server.js
4. **SSL issues**: Check certificate installation
5. **PM2 issues**: Check logs with `pm2 logs`

### Monitoring Commands
```bash
# Real-time logs
pm2 logs --lines 50

# Process monitoring
pm2 monit

# Restart application
pm2 restart mgdc-backend

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 📊 Deployment Summary

### What's Ready:
- ✅ Complete MGDC Fee & Attendance Management System
- ✅ Enhanced fee reports with date range filtering
- ✅ Production-optimized Angular frontend
- ✅ Secure Node.js backend with MongoDB
- ✅ SSL/HTTPS configuration
- ✅ Process management and monitoring
- ✅ Automated deployment scripts

### Key Features Deployed:
- Student and employee management
- Real-time attendance tracking
- Fee collection and payment processing
- Enhanced fee reports with date range filtering
- Department-based filtering
- Export functionality
- Role-based access control
- Responsive Material Design interface

**Deployment Status: READY FOR PRODUCTION** 🚀