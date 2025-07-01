#!/bin/bash

echo "🚀 Starting Cloud Monitoring Dashboard Setup..."
echo "🔄 Initializing Ollama AI service..."

#start ollama in background
ollama serve &
OLLAMA_PID=$!

echo "⏳ Waiting for Ollama to start..."
sleep 10

echo "🔄 DOWNLOADING: Llama 3.2 1B model (1.4GB)"
echo "⏳ This may take 2-5 minutes - please wait..."
echo "📊 Progress will be shown below:"

#download the model and show progress
ollama pull llama3.2:1b

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: Llama 3.2 1B model downloaded successfully!"
    echo "🤖 AI is now ready for use"
    echo "🚀 Dashboard will start automatically..."
else
    echo "❌ ERROR: Failed to download model"
    exit 1
fi

#keep ollama running
wait $OLLAMA_PID 