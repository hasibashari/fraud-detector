#!/bin/bash

# Fraud Detector Development Startup Script
echo "🚀 Starting Fraud Detector Development Environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ All dependencies found."

# Start PostgreSQL if not running
echo "🐘 Checking PostgreSQL..."
if ! pgrep -x "postgres" > /dev/null; then
    echo "🔄 Starting PostgreSQL..."
    sudo service postgresql start
else
    echo "✅ PostgreSQL is already running."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install Python dependencies
echo "🐍 Installing Python model dependencies..."
cd ../model
if [ ! -d "venv" ]; then
    echo "🔄 Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "🎉 Setup complete!"
echo ""
echo "To start the services:"
echo "1. Backend Server: cd backend && npm run dev"
echo "2. Python Model: cd model && python app.py"
echo "3. Open browser: http://localhost:3001"
echo ""
echo "Services will be available at:"
echo "- Frontend/Backend: http://localhost:3001"
echo "- Python AI Model: http://localhost:5000"
