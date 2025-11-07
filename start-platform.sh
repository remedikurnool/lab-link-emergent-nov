#!/bin/bash

echo "🚀 Starting Lab Link Platform..."

# Kill existing processes
pkill -f "next dev" 2>/dev/null

# Start Partner App (Port 3000)
echo "📱 Starting Partner App on port 3000..."
cd /app/apps/web
PORT=3000 yarn dev > /tmp/partner-app.log 2>&1 &
PARTNER_PID=$!

# Start Admin Panel (Port 3001)
echo "👨‍💼 Starting Admin Panel on port 3001..."
cd /app/apps/admin
PORT=3001 yarn dev > /tmp/admin-app.log 2>&1 &
ADMIN_PID=$!

# Wait for apps to start
sleep 8

echo ""
echo "✅ Lab Link Platform Started!"
echo ""
echo "📱 Partner App: http://localhost:3000"
echo "👨‍💼 Admin Panel: http://localhost:3001"
echo ""
echo "📋 Logs:"
echo "   Partner: tail -f /tmp/partner-app.log"
echo "   Admin: tail -f /tmp/admin-app.log"
echo ""
echo "🛑 To stop: pkill -f 'next dev'"
echo ""

# Keep script running
wait
