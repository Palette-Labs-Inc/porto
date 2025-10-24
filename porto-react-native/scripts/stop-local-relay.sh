#!/bin/bash
set -e

echo "🛑 Stopping local Porto relay..."

# Navigate to the correct directory
cd "$(dirname "$0")/.."

# Stop docker compose
docker compose down

# Clean up config file
rm -f .local-relay-config.yaml

echo "✅ Local relay stopped"
echo ""
echo "💡 To start fresh (remove all data):"
echo "   bun relay:clean"
echo ""

