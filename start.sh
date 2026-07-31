#!/bin/bash
# Pro Funding International — Start Script
# Starts both backend and frontend servers

echo "Starting Pro Funding International..."
echo ""

# Start backend
echo "[1/2] Starting backend server (port 3001)..."
cd "$(dirname "$0")/backend"
node server.js &
BACKEND_PID=$!
sleep 1

# Start frontend  
echo "[2/2] Starting frontend dev server (port 5173)..."
cd "$(dirname "$0")/frontend"
npx vite --host 0.0.0.0 &
FRONTEND_PID=$!
sleep 2

echo ""
echo "=========================================="
echo "  Pro Funding International is running!"
echo "=========================================="
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:3001"
echo "  Admin:     http://localhost:5173/admin"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "=========================================="

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
