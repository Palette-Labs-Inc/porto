#!/bin/bash

# Navigate to the correct directory
cd "$(dirname "$0")/.."

echo "📊 Local Porto Relay Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Local relay is NOT running"
    echo ""
    echo "💡 To start it:"
    echo "   pnpm relay:start"
    exit 1
fi

echo "✅ Docker Containers:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Test connectivity
echo "🧪 Testing connectivity..."
if response=$(curl -s -X POST http://localhost:9200 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'); then
    
    chain_id=$(echo "$response" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    if [ "$chain_id" = "0x7a69" ]; then
        echo "✅ Proxy responding on http://localhost:9200"
        echo "   Chain ID: 31337 (0x7a69)"
    else
        echo "⚠️  Proxy responding but unexpected chain ID: $chain_id"
    fi
else
    echo "❌ Proxy not responding on http://localhost:9200"
fi

# Check for config file
echo ""
if [ -f .local-relay-config.yaml ]; then
    echo "✅ Configuration: .local-relay-config.yaml"
else
    echo "⚠️  Configuration file not found"
fi

echo ""
echo "🔧 Environment (.env file):"
if [ -f .env ]; then
    local_relay=$(grep "^LOCAL_RELAY=" .env 2>/dev/null | cut -d'=' -f2)
    if [ -n "$local_relay" ]; then
        echo "   LOCAL_RELAY=$local_relay"
    else
        echo "   LOCAL_RELAY not set in .env"
    fi
else
    echo "   ⚠️  .env file not found (copy from .env.example)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

