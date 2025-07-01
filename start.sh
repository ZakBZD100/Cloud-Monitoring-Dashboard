#!/bin/bash

echo "🚀 Starting Cloud Monitoring Dashboard..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        return 0
    else
        return 1
    fi
}

# Check and clean ports
echo "🔍 Checking ports..."

if check_port 8000; then
    echo "   Port 8000 (dashboard) is in use. Stopping existing containers..."
    docker-compose down > /dev/null 2>&1
fi

if check_port 11434; then
    echo "   Port 11434 (ollama) is in use. This might be a local Ollama instance."
    echo "   Using port 11435 for external access to avoid conflicts."
fi

if check_port 11435; then
    echo "   Port 11435 is also in use. Stopping existing containers..."
    docker-compose down > /dev/null 2>&1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v > /dev/null 2>&1

# Build and start
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "✅ Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "🎉 Services are running!"
    echo "📊 Dashboard: http://localhost:8000"
    echo "🤖 Ollama API: http://localhost:11435"
    echo ""
    echo "💡 If you have issues:"
    echo "   - Check logs: docker-compose logs -f"
    echo "   - Restart: docker-compose restart"
    echo "   - Full reset: docker-compose down -v && docker-compose up --build -d"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi 