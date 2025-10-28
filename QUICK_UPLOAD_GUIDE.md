# Quick Server Upload Instructions

## 📦 Files to Upload to Production Server

### Method 1: Direct File Upload (Recommended for your setup)

**Upload these directories/files to `/var/www/mgdc-attendance/` on your server:**

1. **Backend Directory**: `backend/` (entire folder)
2. **Built Frontend**: `frontend/dist/mgdc-admin-frontend/` (rename to `public/`)
3. **Configuration Files**:
   - `ecosystem.config.json`
   - `.env.production` (rename to `.env`)
   - `nginx.conf`
   - `package.json`
   - `production-deploy.sh`

### Method 2: Git Clone (Alternative)

If you prefer to use git on the server:

```bash
# On production server
cd /var/www
git clone [your-github-repo-url] mgdc-attendance
cd mgdc-attendance
```

## 🚀 Server Setup Commands

Once files are uploaded, run these commands on your server:

### 1. Make deployment script executable
```bash
chmod +x production-deploy.sh
```

### 2. Run the deployment script
```bash
./production-deploy.sh
```

### 3. Edit environment variables
```bash
nano .env
```

Update these values in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/mgdc_fees_production
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CORS_ORIGIN=https://attendendance.askantech.com
NODE_ENV=production
PORT=5000
```

### 4. Restart application
```bash
pm2 restart mgdc-backend
```

## 🔍 Quick Verification

After deployment, test these URLs:

- **Frontend**: https://attendendance.askantech.com/
- **API Health**: https://attendendance.askantech.com/api/health
- **Login**: https://attendendance.askantech.com/login
- **Fee Reports**: https://attendendance.askantech.com/fee-reports

## 📁 Local Build Artifacts Ready

Your local system now has these ready for upload:

- ✅ `frontend/dist/mgdc-admin-frontend/` - Production frontend build
- ✅ `backend/` - Backend with production configuration  
- ✅ All deployment scripts and configurations

## ⚡ Quick Start on Server

Minimum commands to get running:

```bash
# 1. Upload files to /var/www/mgdc-attendance/
# 2. SSH to server and run:

cd /var/www/mgdc-attendance
chmod +x production-deploy.sh
./production-deploy.sh

# 3. Edit .env with your values
nano .env

# 4. Restart
pm2 restart mgdc-backend
```

Your MGDC system will be live at **https://attendendance.askantech.com/** 🚀