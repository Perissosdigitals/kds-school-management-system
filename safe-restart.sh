#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   🛡️  KDS SCHOOL SYSTEM - SAFETY RESTART      ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local name=$2
    local pid=$(lsof -t -i:$port)

    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Killing $name running on port $port (PID: $pid)...${NC}"
        kill -9 $pid
        echo -e "${GREEN}✅ $name stopped.${NC}"
    else
        echo -e "${GREEN}✅ No $name running on port $port.${NC}"
    fi
}

# 1. STOPPING SERVICES
echo -e "\n${BLUE}1. STOPPING RUNNING SERVICES...${NC}"
kill_port 3000 "Backend API (Default)"
kill_port 3001 "Backend API (Zombie?)"
kill_port 3002 "Backend API (Conf)"
kill_port 5173 "Frontend"

# Double check / cleanup generic Node processes if necessary
pkill -f "nest start" || true
pkill -f "vite" || true

# 2. STARTING BACKEND
echo -e "\n${BLUE}2. STARTING BACKEND SERVER...${NC}"
echo -e "${YELLOW}Starting NestJS API Gateway...${NC}"

# Navigate to backend and start in background
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✅ Backend started with PID $BACKEND_PID.${NC}"
echo -e "${YELLOW}Waiting for Backend to initialize (approx 10s)...${NC}"

# visual wait
sleep 10
# Optional: Check if port 3000 is now active
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Backend is listening on port 3000.${NC}"
else
    echo -e "${RED}⚠️  Backend might be taking longer to start. Check backend.log for details.${NC}"
fi

# 3. STARTING FRONTEND
echo -e "\n${BLUE}3. STARTING FRONTEND...${NC}"
echo -e "${YELLOW}Starting Vite Server...${NC}"

npm run dev:stable > frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend started with PID $FRONTEND_PID.${NC}"

# 4. SUMMARY
echo -e "\n${BLUE}===============================================${NC}"
echo -e "${GREEN}   ✨ RESTART COMPLETE ✨   ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "Services are running in the background."
echo -e "📝 Logs:"
echo -e "   - Backend:  ${YELLOW}tail -f backend.log${NC}"
echo -e "   - Frontend: ${YELLOW}tail -f frontend.log${NC}"
echo -e "🌐 Access:"
echo -e "   - App:      ${GREEN}http://localhost:5173${NC}"
echo -e "   - API:      ${GREEN}http://localhost:3000/api${NC}"
echo -e "${BLUE}===============================================${NC}"
