#!/bin/sh

# Start AI Service in background
echo "Starting AI Service on port 5001..."
python3 ai-service/app.py &

# Wait a moment for it to warm up
sleep 5

# Start Go Backend
echo "Starting Go Backend on port 8080..."
./main
