#!/bin/bash

#cloud monitoring dashboard launcher for linux
#author: zakariae elbouzidi

echo "Starting Cloud Monitoring Dashboard..."
echo "Built by Zakariae Elbouzidi"
echo ""

#check if python exists
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "Error: Python is not installed"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

#use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "Using $PYTHON_CMD"

#check if ollama is running
echo "Checking Ollama AI service..."
if ! command -v ollama &> /dev/null; then
    echo "Warning: Ollama not found in PATH"
    echo "Please install Ollama from https://ollama.ai"
    echo "Then run: ollama pull mistral:7b"
    echo ""
fi

#try to ping ollama service
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Warning: Ollama service not responding"
    echo "Starting Ollama service..."
    ollama serve &
    OLLAMA_PID=$!
    echo "Ollama started with PID: $OLLAMA_PID"
    sleep 3
fi

#check if mistral model exists
echo "Checking Mistral 7B model..."
if ! ollama list | grep -q "mistral:7b"; then
    echo "Downloading Mistral 7B model..."
    ollama pull mistral:7b
fi

echo ""
echo "All prerequisites checked"
echo ""

#navigate to backend directory
cd cloud_monitoring_dashboard/backend

#check if requirements are installed
echo "Installing Python dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt

echo ""
echo "Starting Cloud Monitoring Dashboard..."
echo "Dashboard will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

#start the dashboard
$PYTHON_CMD main.py 