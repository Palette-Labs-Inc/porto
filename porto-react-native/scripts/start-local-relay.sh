#!/bin/bash
set -e

echo "🚀 Starting local Porto relay..."

# Navigate to the correct directory
cd "$(dirname "$0")/.."

# Start docker compose
echo "📦 Starting Docker containers..."
docker compose up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to be healthy..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker compose ps | grep -q "healthy"; then
        echo "✅ Containers are healthy!"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Timeout waiting for containers to be healthy"
        docker compose logs
        exit 1
    fi
    sleep 2
done

# Wait a bit more for proxy to be fully ready
sleep 3

# Test the connection
echo "🧪 Testing connection..."
if curl -s -X POST http://localhost:9200 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' | grep -q "0x7a69"; then
    echo "✅ Local relay is responding on http://localhost:9200"
else
    echo "⚠️  Warning: Relay might not be fully ready yet"
fi

# Extract relay configuration
echo "📝 Extracting relay configuration..."
docker run --rm -v porto_state:/app alpine cat /app/relay.yaml > .local-relay-config.yaml 2>/dev/null || true

if [ -f .local-relay-config.yaml ]; then
    echo "✅ Configuration saved to .local-relay-config.yaml"
else
    echo "⚠️  Could not extract relay configuration (this is optional)"
fi

echo ""
echo "✨ Local Porto relay is ready!"
echo ""
echo "📍 Endpoints:"
echo "   - Proxy (use this):  http://localhost:9200"
echo "   - Anvil:             http://localhost:8545"
echo "   - Chain ID:          31337 (0x7a69)"
echo ""
echo "🔧 To use in your app:"
echo "   export LOCAL_RELAY=true"
echo "   bun start"
echo ""
echo "🛑 To stop:"
echo "   bun relay:stop"
echo ""

