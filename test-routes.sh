#!/bin/bash

echo "🔍 Testing Frontend Routes..."
echo "================================"

# Test Dashboard
echo "📊 Testing Dashboard Route:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/dashboard

# Test AI Chat
echo "🤖 Testing AI Chat Route:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/ai-chat

# Test Login
echo "🔐 Testing Login Route:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/login

# Test Register
echo "📝 Testing Register Route:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/register

# Test API
echo "🚀 Testing API Route:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/api

echo "================================"
echo "✅ All routes tested!"
echo ""
echo "🌐 Quick Access Links:"
echo "   Dashboard: http://localhost:3001/dashboard"
echo "   AI Chat:   http://localhost:3001/ai-chat"
echo "   Login:     http://localhost:3001/login"
echo "   Register:  http://localhost:3001/register"
