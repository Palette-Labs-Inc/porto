# 🚀 Local Porto Relay Development Guide

Seamless local development with Porto relay using automated scripts and environment variables.

## ⚡ Quick Start (Recommended)

### First Time Setup

```bash
# One command to set up everything!
pnpm bootstrap

# Start your app
pnpm start
```

The `bootstrap` command automatically:
- Creates `.env` file (if needed)
- Starts local relay
- Deploys contracts
- Syncs addresses to TypeScript

### Subsequent Usage

```bash
# Start your app (relay should still be running)
pnpm start

# Or restart relay if needed
pnpm relay:start
```

### Clean Everything

```bash
# Stop relay and remove all data
pnpm clean
```

That's it! 🎉

## 📋 Available Commands

### Main Commands

| Command | Description |
|---------|-------------|
| `pnpm bootstrap` | **Setup everything** (creates .env, starts relay, syncs contracts) |
| `pnpm clean` | **Clean everything** (stops relay, removes all data) |
| `pnpm start` | Start app (reads LOCAL_RELAY from .env) |

### Relay Commands

| Command | Description |
|---------|-------------|
| `pnpm relay:start` | Start local relay (Anvil + contracts + proxy) |
| `pnpm relay:stop` | Stop local relay |
| `pnpm relay:status` | Check relay status and connectivity |
| `pnpm relay:sync` | Sync local contract addresses to TypeScript |

### Debugging Commands

| Command | Description |
|---------|-------------|
| `pnpm relay:logs` | View all relay logs (live) |
| `pnpm relay:logs:proxy` | View proxy logs only |
| `pnpm relay:logs:anvil` | View anvil logs only |

## 🔄 Typical Workflow

### First Time

```bash
pnpm bootstrap  # Sets up everything
pnpm start      # Start your app
```

### Daily Development

```bash
pnpm start      # App starts (relay persists)
```

### Switching to Production

Edit your `.env` file:
```bash
LOCAL_RELAY=false
```

Restart your app:
```bash
pnpm start
```

### Clean Everything

```bash
pnpm clean      # Stop relay, remove all data
```

## 🔍 How It Works

### Environment-Based Configuration

The app uses a `.env` file to configure which relay to use:

**`.env` file:**
```bash
# Set to 'true' for local development, 'false' for production
LOCAL_RELAY=true
LOCAL_RELAY_URL=http://localhost:9200
PRODUCTION_RELAY_URL=https://rpc.porto.sh
```

**Application code** (`src/lib/porto.ts`):
```typescript
const USE_LOCAL_RELAY = process.env.LOCAL_RELAY === 'true'

const RELAY_URL = USE_LOCAL_RELAY
  ? 'http://localhost:9200'  // Local development
  : 'https://rpc.porto.sh'    // Production
```

The app automatically reads from `.env` on startup. No need to set environment variables manually!

### What Happens When You Run `relay:start`

1. **Starts Docker containers**:
   - Anvil (local Ethereum node) on port 8545
   - State container (deploys contracts)
   - Proxy (main entry point) on port 9200

2. **Deploys contracts**:
   - Orchestrator
   - Delegation Proxy
   - Simulator
   - Funder
   - Escrow
   - EXP1/EXP2 tokens

3. **Creates configuration**:
   - Generates `.local-relay-config.yaml` with all contract addresses
   - All configurations are automatically handled

4. **Auto-syncs contract addresses** ✨:
   - Extracts deployed addresses from the relay
   - Updates `src/lib/_generated/contracts.ts` for chain 31337
   - Your app automatically uses the correct addresses!

5. **Tests connectivity**:
   - Verifies the relay is responding
   - Checks chain ID (31337)

## 📊 Checking Status

```bash
pnpm relay:status
```

Output:
```
📊 Local Porto Relay Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Docker Containers:
NAME              STATUS              PORTS
porto-anvil-1     Up (healthy)        0.0.0.0:8545->8545/tcp
porto-proxy-1     Up                  0.0.0.0:9200->9200/tcp

🧪 Testing connectivity...
✅ Proxy responding on http://localhost:9200
   Chain ID: 31337 (0x7a69)

✅ Configuration: .local-relay-config.yaml

🔧 Environment (.env file):
   LOCAL_RELAY=true
```

## 🏗️ Architecture

```
Your App
   ↓
Porto SDK (src/lib/porto.ts)
   ↓
Proxy (localhost:9200)  ← Main entry point
   ↓
Anvil (localhost:8545)  ← Local blockchain
```

### Components

- **Anvil** (port 8545): Local Ethereum node with deployed contracts
- **Proxy** (port 9200): **Main entry point** - forwards requests to Anvil
- **State**: One-time container that deploys all Porto contracts
- **Relay** (port 9119): Optional advanced features

### Key Details

- **Local Chain ID**: 31337 (0x7a69)
- **Production Chain**: Base Sepolia
- **Local Endpoint**: `http://localhost:9200`
- **Production Endpoint**: `https://rpc.porto.sh`

## 🐛 Troubleshooting

### Relay won't start

```bash
# Clean everything and start fresh
pnpm relay:clean
pnpm relay:start
```

### Check if it's running

```bash
pnpm relay:status
```

### View logs for errors

```bash
# All logs
pnpm relay:logs

# Specific service
pnpm relay:logs:proxy
pnpm relay:logs:anvil
```

### Containers not starting

If Docker containers fail to start:

1. Check Docker is running
2. Check ports 8545 and 9200 are not in use:
   ```bash
   lsof -i :8545
   lsof -i :9200
   ```
3. Clean and restart:
   ```bash
   pnpm relay:clean
   pnpm relay:start
   ```

### App not using local relay

1. **Check your `.env` file** - make sure `LOCAL_RELAY=true`
2. **Verify the file exists**:
   ```bash
   cat .env | grep LOCAL_RELAY
   ```
3. **Create it if missing**:
   ```bash
   cp .env.example .env
   # Then edit .env to set LOCAL_RELAY=true
   ```
4. **Check the console output** when starting your app:
   ```
   🔗 Porto Relay: LOCAL (http://localhost:9200)
   ```

If you see "PRODUCTION" instead of "LOCAL", your `.env` file isn't configured correctly.

## 🔧 Advanced Usage

### Manual Control

The `.env` file is the recommended way, but you can override it:

```bash
# Start relay
pnpm relay:start

# Override .env for this session only
LOCAL_RELAY=true pnpm dev

# Or force production
LOCAL_RELAY=false pnpm dev
```

Note: Command-line environment variables override `.env` values.

### Testing RPC Calls

```bash
# Check chain ID
cast rpc --rpc-url http://localhost:9200 eth_chainId

# Get block number
curl -X POST http://localhost:9200 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'
```

### Accessing Configuration

The contract addresses and configuration are saved in:
```
.local-relay-config.yaml
```

This file is automatically generated and contains all deployed contract addresses.

## 📝 Contract Addresses

Contract addresses are **dynamically generated** when you start the relay. The system automatically syncs them:

1. **Deployed** by the `state` container
2. **Saved** to `/app/relay.yaml` in the Docker volume
3. **Extracted** to `.local-relay-config.yaml` for reference
4. **Auto-synced** to `src/lib/_generated/contracts.ts` for chain 31337 ✨

This means your app automatically uses the correct addresses - no manual updates needed!

### Key Contracts

- **EXP1** (`0xeD1DB...`): Test token for minting and transfers
- **EXP2** (`0xf7Cd8...`): Fee token for gas payments
- **Orchestrator**: Account management
- **Delegation Proxy**: EIP-7702 delegation
- **Simulator**: Transaction simulation
- **Funder**: Gas sponsorship
- **Escrow**: Asset management

### Manual Sync (if needed)

If addresses get out of sync, run:
```bash
pnpm relay:sync
```

This extracts addresses from the running relay and updates your TypeScript code.

## 🎯 Best Practices

1. **Use `.env` file**: Keep your configuration in `.env` (never commit it!)
2. **Use `.env.example`**: Always keep `.env.example` updated as a template
3. **Always use scripts**: Use `pnpm relay:start` instead of manual `docker compose`
4. **Check status**: Run `pnpm relay:status` to verify everything is working
5. **Clean slate**: Use `pnpm relay:clean` when things go wrong
6. **Monitor logs**: Keep `pnpm relay:logs` running in a separate terminal
7. **Stop when done**: Run `pnpm relay:stop` to free up resources

## 📚 Additional Resources

- [Porto Documentation](https://porto.sh/docs)
- [Docker Compose Configuration](./docker-compose.yml)
- [Porto SDK Configuration](./src/lib/porto.ts)

## 💡 Tips

- The relay **persists data** between starts (unless you use `relay:clean`)
- Contract addresses **change** when you clean and restart
- The app **automatically detects** when local relay is available
- Use `relay:status` to quickly check everything is working
- Local development is **faster** than production for testing

