#!/bin/bash

# Brand Ambassador SaaS - Development Setup Script
echo "🛠️  Setting up Brand Ambassador SaaS for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL or use Docker."
    echo "   Docker command: docker run -d --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=brand_ambassador_saas -p 5432:5432 postgres:15"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📋 Creating environment file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please update backend/.env with your actual configuration values"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Development setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "   Backend: cd backend && npm run start:dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Documentation: http://localhost:3001/api"
