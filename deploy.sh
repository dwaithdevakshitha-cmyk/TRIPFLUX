#!/bin/bash
# ============================================================
#  TripFlux — AWS Deployment Script
#  Server : EC2 @ 13.49.231.22
#  Domain : tripflux.tours / www.tripflux.tours
#  Author : TripFlux DevOps
#  Updated: 2026-03-17
# ============================================================

set -e   # Exit immediately if any command fails

echo ""
echo "========================================"
echo "  🚀 TripFlux Deployment Starting..."
echo "========================================"
echo ""

# ----- CONFIG -----
APP_DIR="/home/ubuntu/tripflux"
BRANCH="main"
FRONTEND_PORT=3011
BACKEND_PORT=3010
PM2_FRONTEND_NAME="tripflux-frontend"
PM2_BACKEND_NAME="tripflux-backend"

# ----- STEP 1: Pull latest code -----
echo "📥 [1/6] Pulling latest code from GitHub..."
cd "$APP_DIR"
git fetch origin "$BRANCH"
git reset --hard origin/"$BRANCH"
echo "✅ Code pulled successfully."
echo ""

# ----- STEP 2: Install dependencies -----
echo "📦 [2/6] Installing dependencies..."
npm install --production=false
echo "✅ Dependencies installed."
echo ""

# ----- STEP 3: Build frontend -----
echo "🔨 [3/6] Building frontend (Vite)..."
npm run build
echo "✅ Frontend built into /dist"
echo ""

# ----- STEP 4: Restart backend server -----
echo "🔄 [4/6] Restarting backend server (port $BACKEND_PORT)..."
if pm2 describe "$PM2_BACKEND_NAME" > /dev/null 2>&1; then
    pm2 restart "$PM2_BACKEND_NAME"
    echo "✅ Backend restarted."
else
    pm2 start server.cjs --name "$PM2_BACKEND_NAME" -- --port $BACKEND_PORT
    echo "✅ Backend started fresh."
fi
echo ""

# ----- STEP 5: Restart frontend server -----
echo "🔄 [5/6] Restarting frontend server (port $FRONTEND_PORT)..."
if pm2 describe "$PM2_FRONTEND_NAME" > /dev/null 2>&1; then
    pm2 restart "$PM2_FRONTEND_NAME"
    echo "✅ Frontend restarted."
else
    pm2 serve dist "$FRONTEND_PORT" --name "$PM2_FRONTEND_NAME" --spa
    echo "✅ Frontend started fresh."
fi
echo ""

# ----- STEP 6: Save PM2 process list -----
echo "💾 [6/6] Saving PM2 process list..."
pm2 save
echo "✅ PM2 process list saved."
echo ""

# ----- DONE -----
echo "========================================"
echo "  ✅ Deployment Complete!"
echo "  🌐 https://tripflux.tours"
echo "  🌐 http://13.49.231.22"
echo "========================================"
pm2 list
echo ""
