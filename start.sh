#!/bin/bash

# Brand Ambassador SaaS - Startup Script
echo "🚀 Starting Brand Ambassador SaaS Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
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

# Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm install
cd ../frontend && npm install
cd ..

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3001"
    echo "   API Documentation: http://localhost:3001/api"
    echo ""
    echo "📊 Database:"
    echo "   Host: localhost:5432"
    echo "   Database: brand_ambassador_saas"
    echo "   Username: postgres"
    echo "   Password: password"
    echo ""
    echo "🔧 To stop the services: docker-compose down"
    echo "📝 To view logs: docker-compose logs -f"
else
    echo "❌ Some services failed to start. Check the logs with: docker-compose logs"
    exit 1
fi
