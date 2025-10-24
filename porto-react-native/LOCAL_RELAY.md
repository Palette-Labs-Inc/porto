# Running Porto Relay Locally

## Quick Start

### 1. Start the local Porto Relay (Docker)

```bash
cd porto-react-native
docker compose up -d
```

This will:
- Start a local Anvil instance on port 8545
- Deploy all Porto contracts
- Start the proxy on `http://localhost:9200`
- (OrbStack users can also use `https://relay.local`)

### 2. Verify the local relay is running

```bash
# Check container status
docker compose ps

# Test with a simple RPC call
cast rpc --rpc-url http://localhost:9200 eth_chainId

# Or with curl
curl -X POST http://localhost:9200 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'
```

You should see output like `"0x7a69"` (chain ID 31337) or a block number.

### 3. Configure your app to use local relay

In `src/lib/porto.ts`, change:

```typescript
const USE_LOCAL_RELAY = true  // Set to true
```

The relay URL is automatically set to `http://localhost:9200`.

### 4. Restart your Expo app

```bash
# Stop current dev server (Ctrl+C)
bun start
```

## Switching Back to Production

To use the production relay (`https://rpc.porto.sh`):

1. Set `USE_LOCAL_RELAY = false` in `src/lib/porto.ts`
2. Restart your app

## Stopping the Local Relay

```bash
cd porto-react-native
docker compose down

# To also remove volumes (start fresh next time)
docker compose down -v
```

## Troubleshooting

### Containers not starting

If you get git branch errors when using `curl -sSL s.porto.sh/docker`, use the local docker-compose.yml instead:

```bash
cd porto-react-native
docker compose up -d
```

The local `docker-compose.yml` has been updated to use the `main` branch.

### Checking logs

```bash
docker compose logs anvil    # Check anvil logs
docker compose logs proxy    # Check proxy logs
docker compose logs relay    # Check relay logs (if running)
```

### Starting fresh

```bash
docker compose down -v        # Remove everything including volumes
docker compose up -d          # Start fresh
```

## Architecture

- **Anvil** (port 8545): Local Ethereum node
- **Proxy** (port 9200): Main entry point, forwards requests to anvil
- **State**: One-time container that deploys contracts and creates config files
- **Relay** (port 9119): Optional, provides additional Porto functionality

## Notes

- Local proxy runs on port 9200 (this is what your app will use)
- Local anvil runs on port 8545  
- Production relay: https://rpc.porto.sh
- Chain ID: 31337 (anvil default)
- The contracts are deployed to the local anvil and saved to the state volume
- Make sure to restart your app after changing the relay URL

