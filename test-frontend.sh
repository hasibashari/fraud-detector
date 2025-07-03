#!/bin/bash

# Frontend Testing Script for Fraud Detection System
echo "🧪 Testing Frontend Components..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================"

echo -e "\n${BLUE}1. Checking HTML Files...${NC}"
HTML_FILES=(
    "frontend/pages/index.html"
    "frontend/pages/login.html" 
    "frontend/pages/register.html"
    "frontend/pages/ai-chat.html"
    "frontend/pages/auth-success.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
        # Check if HTML is well-formed (basic validation)
        if grep -q "<!DOCTYPE html>" "$file" && grep -q "</html>" "$file"; then
            echo -e "   📄 HTML structure: ${GREEN}Valid${NC}"
        else
            echo -e "   📄 HTML structure: ${RED}Invalid${NC}"
        fi
    else
        echo -e "${RED}❌ $file (missing)${NC}"
    fi
done

echo -e "\n${BLUE}2. Checking JavaScript Files...${NC}"
JS_FILES=(
    "frontend/js/main.js"
    "frontend/js/index.js"
    "frontend/js/auth.js"
    "frontend/js/ai-chat.js"
    "frontend/js/config.js"
    "frontend/js/tailwind-config.js"
)

for file in "${JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
        # Check JavaScript syntax
        if node -c "$file" 2>/dev/null; then
            echo -e "   🔧 Syntax: ${GREEN}Valid${NC}"
        else
            echo -e "   🔧 Syntax: ${RED}Errors found${NC}"
        fi
    else
        echo -e "${RED}❌ $file (missing)${NC}"
    fi
done

echo -e "\n${BLUE}3. Checking CSS Files...${NC}"
CSS_FILES=(
    "frontend/css/main.css"
)

for file in "${CSS_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
        # Check for CSS syntax (basic)
        if grep -q "{" "$file" && grep -q "}" "$file"; then
            echo -e "   🎨 CSS structure: ${GREEN}Valid${NC}"
        else
            echo -e "   🎨 CSS structure: ${YELLOW}Incomplete${NC}"
        fi
    else
        echo -e "${RED}❌ $file (missing)${NC}"
    fi
done

echo -e "\n${BLUE}4. Checking Configuration Dependencies...${NC}"

# Check if all HTML files include config.js
for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "config.js" "$file"; then
            echo -e "${GREEN}✅ $(basename $file) includes config.js${NC}"
        else
            echo -e "${RED}❌ $(basename $file) missing config.js${NC}"
        fi
    fi
done

echo -e "\n${BLUE}5. Checking for Hardcoded URLs...${NC}"
if grep -r "localhost:3001" frontend/js/ | grep -v "config.js" | grep -v "fallback" | grep -v "development"; then
    echo -e "${RED}❌ Found hardcoded URLs outside config${NC}"
else
    echo -e "${GREEN}✅ No problematic hardcoded URLs found${NC}"
fi

echo -e "\n${BLUE}6. Checking API Configuration...${NC}"
if [ -f "frontend/js/config.js" ]; then
    if grep -q "API_BASE_URL" "frontend/js/config.js"; then
        echo -e "${GREEN}✅ API configuration found${NC}"
    else
        echo -e "${RED}❌ API configuration missing${NC}"
    fi
fi

echo -e "\n${BLUE}7. Checking for Console Logs (Cleanup Check)...${NC}"
CONSOLE_COUNT=$(grep -r "console\." frontend/js/ --exclude="logger.js" | wc -l)
if [ "$CONSOLE_COUNT" -lt 5 ]; then
    echo -e "${GREEN}✅ Console logs minimized ($CONSOLE_COUNT found)${NC}"
else
    echo -e "${YELLOW}⚠️  Many console logs found ($CONSOLE_COUNT) - consider cleanup${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Frontend Test Complete${NC}"
echo ""
echo -e "${BLUE}🌐 Quick Test URLs:${NC}"
echo "   Dashboard: http://localhost:3001/dashboard"
echo "   AI Chat:   http://localhost:3001/ai-chat" 
echo "   Login:     http://localhost:3001/login"
echo "   Register:  http://localhost:3001/register"
