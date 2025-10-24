#!/bin/bash
set -e

echo "🧹 Cleaning local Porto relay (removing all data)..."

# Navigate to the correct directory
cd "$(dirname "$0")/.."

# Stop and remove everything including volumes
docker compose down -v

# Clean up config file
rm -f .local-relay-config.yaml

echo "✅ Local relay cleaned (all data removed)"
echo ""
echo "💡 To start again:"
echo "   pnpm relay:start"
echo ""

