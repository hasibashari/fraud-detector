#!/bin/bash

# FRONTEND_TEST.sh - Test script untuk memeriksa frontend fixes
echo "=== Testing Frontend Fixes ==="

# Check if all required files exist
echo "1. Checking if new configuration files exist..."
if [ -f "frontend/js/config.js" ]; then
    echo "✅ config.js exists"
else
    echo "❌ config.js missing"
fi

if [ -f "frontend/js/tailwind-config.js" ]; then
    echo "✅ tailwind-config.js exists"
else
    echo "❌ tailwind-config.js missing"
fi

echo -e "\n2. Checking HTML files for Bootstrap references..."
BOOTSTRAP_REFS=$(grep -r "bootstrap" frontend/pages/ || echo "none")
if [ "$BOOTSTRAP_REFS" = "none" ]; then
    echo "✅ No Bootstrap references found in HTML files"
else
    echo "❌ Bootstrap references still exist:"
    echo "$BOOTSTRAP_REFS"
fi

echo -e "\n3. Checking for problematic hardcoded API URLs..."
# Get lines with localhost:3001 and check if previous line has fallback/development comment
LOCALHOST_LINES=$(grep -n "localhost:3001" frontend/js/main.js)
if [ -z "$LOCALHOST_LINES" ]; then
    echo "✅ No localhost URLs found"
elif grep -B 1 "localhost:3001" frontend/js/main.js | grep -q "fallback\|development"; then
    echo "✅ localhost URL is properly documented as fallback"
else
    echo "❌ Problematic hardcoded API URLs found"
fi

echo -e "\n4. Checking for inline Tailwind configurations..."
INLINE_CONFIGS=$(grep -r "tailwind\.config.*=" frontend/pages/ | wc -l)
if [ "$INLINE_CONFIGS" -eq 0 ]; then
    echo "✅ No inline Tailwind configurations found"
else
    echo "❌ Found $INLINE_CONFIGS inline Tailwind configurations"
fi

echo -e "\n5. Checking if all HTML files include config.js..."
for file in frontend/pages/*.html; do
    if grep -q "config.js" "$file"; then
        echo "✅ $(basename $file) includes config.js"
    else
        echo "❌ $(basename $file) missing config.js"
    fi
done

echo -e "\n6. Checking JavaScript syntax..."
for file in frontend/js/*.js; do
    if node -c "$file" 2>/dev/null; then
        echo "✅ $(basename $file) syntax is valid"
    else
        echo "❌ $(basename $file) has syntax errors"
    fi
done

echo -e "\n=== Frontend Test Complete ==="
