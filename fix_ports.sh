#!/bin/bash

echo "🔧 Fixing port conflicts for Cloud Monitoring Dashboard..."

#check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🧹 Cleaning up..."

#stop any existing containers
echo "   Stopping existing containers..."
docker-compose down -v > /dev/null 2>&1

#stop all containers that might use our ports
echo "   Stopping all containers..."
docker stop $(docker ps -q) 2>/dev/null || true

#stop local Ollama service if running
echo "   Stopping local Ollama service..."
sudo systemctl stop ollama 2>/dev/null || true
sudo pkill -f ollama 2>/dev/null || true

#kill any processes using our ports
echo "   Killing processes using ports 8000 and 11434..."
sudo lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sudo lsof -ti:11434 | xargs kill -9 2>/dev/null || true

#clean Docker system
echo "   Cleaning Docker cache..."
docker system prune -f > /dev/null 2>&1

#wait a moment for ports to be released
echo "   Waiting for ports to be released..."
sleep 3

echo "✅ Port conflicts fixed!"
echo ""
echo "🚀 Now you can run:"
echo "   docker-compose up --build -d"
echo ""
echo "💡 If you still have issues, try:"
echo "   docker-compose down -v && docker-compose up --build -d" 