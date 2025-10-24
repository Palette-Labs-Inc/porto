# 🚀 Local Porto Relay Development Guide

Seamless local development with Porto relay using automated scripts and environment variables.

## ⚡ Quick Start (Recommended)

### First Time Setup

```bash
# 1. Copy the environment template
cp .env.example .env

# 2. Edit .env and set LOCAL_RELAY=true
# Open .env in your editor and change:
# LOCAL_RELAY=true

# 3. Start the local relay
pnpm relay:start

# 4. Start your app (reads from .env)
pnpm start
```

### Subsequent Usage

```bash
# Start the relay (if not already running)
pnpm relay:start

# Start your app
pnpm start
```

That's it! 🎉

## 📋 Available Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `pnpm relay:start` | Start local relay (Anvil + contracts + proxy) |
| `pnpm relay:stop` | Stop local relay |
| `pnpm relay:clean` | Stop and remove all data (fresh start) |
| `pnpm relay:status` | Check relay status and connectivity |

### App Commands

| Command | Description |
|---------|-------------|
| `pnpm start` | Start app (uses LOCAL_RELAY from .env) |
| `pnpm dev` | Start Expo dev server (no tunnel) |
| `pnpm android` | Run on Android |
| `pnpm ios` | Run on iOS |

### Debugging Commands

| Command | Description |
|---------|-------------|
| `pnpm relay:logs` | View all relay logs (live) |
| `pnpm relay:logs:proxy` | View proxy logs only |
| `pnpm relay:logs:anvil` | View anvil logs only |

## 🔄 Typical Workflow

### Starting Development

```bash
# Terminal 1: Start local relay
pnpm relay:start

# Terminal 2: Start your app
pnpm start
```

The app will use the relay specified in your `.env` file.

### Switching to Production

Edit your `.env` file:
```bash
# Change from LOCAL_RELAY=true to:
LOCAL_RELAY=false
```

Then restart your app:
```bash
pnpm start
```

### Stopping Development

```bash
# Stop the relay when done
pnpm relay:stop

# Or clean everything (removes all data)
pnpm relay:clean
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

4. **Tests connectivity**:
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

Contract addresses are **dynamically generated** each time you start the relay. They are:

1. Deployed by the `state` container
2. Saved to `/app/relay.yaml` in the Docker volume
3. Extracted to `.local-relay-config.yaml` for reference

Key contracts:
- **Orchestrator**: Account management
- **Delegation Proxy**: EIP-7702 delegation
- **Simulator**: Transaction simulation
- **Funder**: Gas sponsorship
- **Escrow**: Asset management
- **EXP1/EXP2**: Test tokens

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

