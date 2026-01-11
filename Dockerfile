# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app/backend

# Install build dependencies for CGO (SQLite)
RUN apk add --no-cache gcc musl-dev

COPY backend/go.mod backend/go.sum ./
RUN go mod tidy && go mod download
COPY backend/ .

# Build static binary with CGO enabled for SQLite
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Stage 3: Final Image
FROM alpine:latest
WORKDIR /root/

# Install runtime dependencies (Go + Python + SQLite)
RUN apk add --no-cache \
    sqlite-libs \
    ca-certificates \
    python3 \
    py3-pip \
    py3-pandas \
    py3-numpy \
    py3-scikit-learn

# Copy Backend Binary
COPY --from=backend-builder /app/backend/main .

# Copy Frontend Build to ./dist
COPY --from=frontend-builder /app/frontend/dist ./dist

# Copy AI Service Code & Install Deps
COPY ai-service/requirements.txt ./ai-service/requirements.txt
# Note: apk py3- packages handle heavy lifting, pip for flask
RUN pip3 install --break-system-packages -r ai-service/requirements.txt 

COPY ai-service/ ./ai-service/

# Create Data directory for SQLite
RUN mkdir -p data

# Copy Start Script
COPY start.sh .
RUN chmod +x start.sh

# Expose Ports (8080=Go, 5001=Python)
EXPOSE 8080

# Environment Defaults
ENV GIN_MODE=release
ENV PORT=8080
ENV NEO4J_URI=bolt://neo4j:7687

# Run start script (launches both)
CMD ["./start.sh"]
