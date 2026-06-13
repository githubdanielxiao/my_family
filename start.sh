#!/bin/bash

echo "🚀 Family Management System - Development Server"
echo ""
echo "⏳ Starting services..."
echo ""

# Start backend
echo "📡 Starting backend on http://localhost:5000"
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend on http://localhost:3000"
cd client
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both services are running!"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit 0" INT

# Wait for both processes
wait
