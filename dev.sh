#!/bin/bash

# Kill all background processes on exit
trap "kill 0" EXIT

echo "🚀 Starting Synapse Development Stack..."

# 0. Ensure Neo4j is running
echo "🐘 Starting Neo4j (Database container)..."
docker-compose up -d neo4j

# 1. Start AI Service (Python)
echo "📦 Starting AI Service (Python)..."
cd ai-service
python3 app.py &
cd ..

# 2. Build and Start Backend (Go) - using go build for fresh binary
echo "⚙️ Building Backend (Go)..."
cd backend
go mod tidy
go build -o main .
echo "⚙️ Starting Backend..."
./main &
cd ..

# 3. Start Frontend (Vite)
echo "💻 Starting Frontend (React)..."
cd frontend
npm run dev &
cd ..

echo ""
echo "✅ All services are starting..."
echo "------------------------------------------------"
echo "Frontend:    http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "AI Service:  http://localhost:5001"
echo "Neo4j:       http://localhost:7474"
echo "------------------------------------------------"
echo "Press Ctrl+C to stop all services."

# Wait for all background processes
wait
