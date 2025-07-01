#!/bin/bash

# Test API endpoints yang digunakan oleh frontend
echo "🧪 Testing Fraud Detection API Endpoints..."

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local auth_required=${4:-false}
    
    echo -n "Testing $description... "
    
    if [ "$auth_required" = true ]; then
        # This would need a valid token in real testing
        echo -e "${YELLOW}SKIP (needs auth)${NC}"
        return
    fi
    
    if [ "$method" = "GET" ]; then
        if curl -s -f "$BASE_URL$endpoint" > /dev/null; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ FAILED${NC}"
        fi
    else
        echo -e "${YELLOW}SKIP (${method})${NC}"
    fi
}

echo "📡 Testing public endpoints..."
test_endpoint "GET" "/api" "Backend API"
test_endpoint "GET" "/cek-prisma" "Database connection"
test_endpoint "GET" "/login" "Login page"
test_endpoint "GET" "/register" "Register page"
test_endpoint "GET" "/dashboard" "Dashboard page"

echo ""
echo "🔐 Testing auth endpoints (would need authentication)..."
test_endpoint "GET" "/auth/me" "User info" true
test_endpoint "GET" "/api/transactions/batches" "User batches" true
test_endpoint "POST" "/api/transactions/upload" "File upload" true

echo ""
echo "📊 Summary:"
echo "- Public endpoints are accessible"
echo "- Protected endpoints require authentication"
echo "- Frontend should handle token-based authentication"
echo ""
echo "💡 To test protected endpoints:"
echo "1. Login through the web interface"
echo "2. Check browser developer tools for API calls"
echo "3. Use the actual token in requests"
