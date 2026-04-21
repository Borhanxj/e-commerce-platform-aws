#!/bin/bash

# Setup Script - Initial project setup

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== E-Commerce AWS Platform Setup ===" 
echo "Project Root: $PROJECT_ROOT"

# Make scripts executable
chmod +x "$SCRIPT_DIR/deploy.sh"
chmod +x "$SCRIPT_DIR/health-check.sh"

# Create necessary directories
mkdir -p "$PROJECT_ROOT"/{build,dist,logs}

# Copy environment files if they don't exist
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "Creating backend/.env from config/dev.env..."
    cp "$PROJECT_ROOT/config/dev.env" "$PROJECT_ROOT/backend/.env"
fi

if [ ! -f "$PROJECT_ROOT/services/api/.env" ]; then
    echo "Creating services/api/.env..."
    cp "$PROJECT_ROOT/config/dev.env" "$PROJECT_ROOT/services/api/.env"
fi

# Install backend dependencies
if [ -f "$PROJECT_ROOT/services/api/package.json" ]; then
    echo "Installing backend dependencies..."
    cd "$PROJECT_ROOT/services/api"
    npm install
fi

# Install frontend dependencies
if [ -f "$PROJECT_ROOT/services/web/package.json" ]; then
    echo "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/services/web"
    npm install
fi

# Install invoice service dependencies
if [ -f "$PROJECT_ROOT/services/invoice/requirements.txt" ]; then
    echo "Installing invoice service dependencies..."
    cd "$PROJECT_ROOT/services/invoice"
    pip install -r requirements.txt
fi

echo ""
echo "=== Setup Complete ===" 
echo ""
echo "Next steps:"
echo "1. Configure AWS: aws configure"
echo "2. Review environment variables: cat config/dev.env"
echo "3. Deploy to dev: ./scripts/deploy.sh dev us-east-1"
echo "4. Check health: ./scripts/health-check.sh dev us-east-1"
