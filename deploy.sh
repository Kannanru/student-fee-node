#!/bin/bash

# Deployment Script for MGDC Fee Management System
# Server: https://attendendance.askantech.com/

echo "🚀 Starting deployment to production server..."

# Set production environment
export NODE_ENV=production

# Navigate to project directory
cd /var/www/html/mgdc-fees

# Pull latest code from GitHub
echo "📥 Pulling latest code..."
git pull origin main

# Install/Update backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci --only=production

# Install/Update frontend dependencies and build
echo "🏗️  Building frontend..."
cd ../frontend
npm ci
npm run build --prod

# Copy built frontend to backend public folder
echo "📁 Copying frontend build to backend..."
rm -rf ../backend/public/*
cp -r dist/mgdc-admin-frontend/* ../backend/public/

# Go back to backend
cd ../backend

# Run database migrations if needed
# echo "🗄️  Running database migrations..."
# npm run migrate

# Restart the application
echo "🔄 Restarting application..."
pm2 restart mgdc-fees || pm2 start server.js --name mgdc-fees

# Check if application is running
echo "✅ Checking application status..."
pm2 status mgdc-fees

echo "🎉 Deployment completed successfully!"
echo "🌐 Application is available at: https://attendendance.askantech.com/"