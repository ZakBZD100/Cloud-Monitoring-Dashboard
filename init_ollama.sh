#!/bin/bash

echo "Starting Cloud Monitoring Dashboard Setup..."
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Progress will be shown below:"
echo ""

# Start the services
docker-compose up --build -d

echo "AI is now ready for use"
echo "Dashboard will start automatically..."
echo ""
echo "Access your dashboard at: http://localhost:8000" 