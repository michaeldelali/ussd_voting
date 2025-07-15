#!/bin/bash

# Production Deployment Script for Borbor Carnival Voting System
# This script helps deploy the application to production using PM2

set -e # Exit on any error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing PM2..."
    npm install -g pm2
    print_status "PM2 installed successfully"
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found!"
    print_warning "Please create .env.production based on .env.production.example"
    exit 1
fi

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    print_status "Creating logs directory..."
    mkdir -p logs
fi

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production

# Build the application
print_status "Building the application..."
npm run build

# Run database migrations if using Prisma
if [ -f "prisma/schema.prisma" ]; then
    print_status "Running database migrations..."
    npx prisma generate
    npx prisma migrate deploy
fi

# Update ecosystem.config.js with current directory
CURRENT_DIR=$(pwd)
sed -i "s|cwd: '/path/to/your/app'|cwd: '$CURRENT_DIR'|" ecosystem.config.js

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop borbor-carnival-voting 2>/dev/null || true

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_status "🎉 Deployment completed successfully!"
print_status "Application is running on port 3000"
print_status ""
print_status "Useful PM2 commands:"
print_status "  pm2 status                    - Check application status"
print_status "  pm2 logs borbor-carnival-voting - View application logs"
print_status "  pm2 restart borbor-carnival-voting - Restart application"
print_status "  pm2 stop borbor-carnival-voting - Stop application"
print_status "  pm2 reload borbor-carnival-voting - Graceful reload"
print_status "  pm2 monit                     - Monitor processes"
