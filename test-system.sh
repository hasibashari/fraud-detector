#!/bin/bash

# Test script untuk Fraud Detection System
echo "🧪 Testing Fraud Detection System..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if service is running
check_service() {
    local url=$1
    local service_name=$2
    
    echo -n "Testing $service_name... "
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check if port is in use
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -i ":$port" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name running on port $port${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $service_name not running on port $port${NC}"
        return 1
    fi
}

echo "🔍 Checking services..."

# Check if backend is running
check_port 3001 "Backend Server"
BACKEND_STATUS=$?

# Check if Python model is running
check_port 5000 "Python Model"
PYTHON_STATUS=$?

echo ""
echo "🌐 Testing API endpoints..."

# Test backend API if running
if [ $BACKEND_STATUS -eq 0 ]; then
    check_service "http://localhost:3001/api" "Backend API"
    check_service "http://localhost:3001/cek-prisma" "Database Connection"
fi

# Test Python model API if running
if [ $PYTHON_STATUS -eq 0 ]; then
    check_service "http://localhost:5000/health" "Python Model Health"
fi

echo ""
echo "📁 Checking file structure..."

# Check critical files
files=(
    "backend/package.json"
    "backend/.env"
    "backend/index.js"
    "backend/prisma/schema.prisma"
    "frontend/js/main.js"
    "frontend/js/auth.js"
    "frontend/pages/login.html"
    "frontend/pages/index.html"
    "model/app.py"
    "model/requirements.txt"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
    fi
done

echo ""
echo "🔧 Environment check..."

# Check Node.js
if command -v node > /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not installed${NC}"
fi

# Check Python
if command -v python3 > /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python 3 not installed${NC}"
fi

# Check PostgreSQL
if command -v psql > /dev/null; then
    if pgrep -x "postgres" > /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL running${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL installed but not running${NC}"
    fi
else
    echo -e "${RED}❌ PostgreSQL not installed${NC}"
fi

echo ""
echo "📋 Summary:"

if [ $BACKEND_STATUS -eq 0 ] && [ $PYTHON_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 All services are running properly!${NC}"
    echo "🌐 Access the application at: http://localhost:3001"
elif [ $BACKEND_STATUS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Backend is running, but Python model is not started${NC}"
    echo "▶️  Start Python model: cd model && python app.py"
elif [ $PYTHON_STATUS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Python model is running, but backend is not started${NC}"
    echo "▶️  Start backend: cd backend && npm run dev"
else
    echo -e "${RED}❌ Services are not running${NC}"
    echo "▶️  Start services with: ./start-dev.sh"
fi

echo ""
echo "🆘 Need help? Check the README.md file for troubleshooting."
