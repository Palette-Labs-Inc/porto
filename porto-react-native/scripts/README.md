# Porto Local Relay Scripts

Automated scripts for managing the local Porto relay infrastructure.

## Scripts Overview

| Script | Description |
|--------|-------------|
| `start-local-relay.sh` | Starts Docker containers and sets up local relay |
| `stop-local-relay.sh` | Stops Docker containers |
| `clean-local-relay.sh` | Stops containers and removes all data |
| `status-local-relay.sh` | Shows current status and configuration |
| `sync-local-contracts.ts` | Syncs deployed contract addresses to TypeScript |

## How Contract Addresses Are Generated

```bash
--funder-signing-key 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6
--orchestrator 0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35
--delegation-proxy 0xb19b36b1456E65E3A6D514D3F715f204BD59f431
# ... etc
```

### Answer: They're dynamically generated!

Here's the complete flow:

#### 1. **Test Mnemonic** (Always the Same)

The relay uses Anvil's standard test mnemonic:
```
"test test test test test test test test test test test junk"
```

This generates 20 deterministic test accounts.

#### 2. **Signing Key Selection**

The `funder-signing-key` is **account #9** from that mnemonic:
```
(9) 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720  (address)
    0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6  (private key)
```

#### 3. **Contract Deployment** (The `state` Container)

When you run `pnpm relay:start`, the **state** container:

1. Starts Anvil (local Ethereum node)
2. Deploys all Porto contracts using `forge`
3. Saves contract addresses to `/app/relay.yaml` in Docker volume
4. Exits (it's a one-time setup container)

**Contracts deployed:**
- **Orchestrator**: Account management
- **Delegation Proxy**: EIP-7702 delegation  
- **Simulator**: Transaction simulation
- **Funder**: Gas sponsorship
- **Escrow**: Asset management
- **EXP1/EXP2**: Test tokens

#### 4. **Configuration File Generated**

The relay configuration is saved in the Docker volume at `/app/relay.yaml`:

```yaml
orchestrator: 0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35
delegation_proxy: 0xb19b36b1456E65E3A6D514D3F715f204BD59f431
simulator: 0x8ce361602B935680E8DeC218b820ff5056BeB7af
funder: 0xe1Aa25618fA0c7A1CFDab5d6B456af611873b629
escrow: 0xe1DA8919f262Ee86f9BE05059C9280142CF23f48
chains:
  anvil:
    assets:
      exp:
        address: 0xeD1DB453C3156Ff3155a97AD217b3087D5Dc5f6E
      exp2:
        address: 0xf7Cd8fa9b94DB2Aa972023b379c7f72c65E4De9D
```

#### 5. **Automatic Extraction & Sync** ✨

The `start-local-relay.sh` script:

**A. Extracts configuration:**
```bash
docker run --rm -v porto_state:/app alpine cat /app/relay.yaml \
    > .local-relay-config.yaml
```

**B. Auto-syncs to TypeScript:**
```bash
tsx scripts/sync-local-contracts.ts
```

This **automatically updates** `src/lib/_generated/contracts.ts` with the correct addresses for chain 31337!

**What gets synced:**
- `exp1Address[31337]` → Address from relay deployment
- `exp2Address[31337]` → Address from relay deployment

**Why this matters:**
Your app's contract calls will work immediately without manual configuration. The addresses in your TypeScript code always match what's deployed on the local relay.

## Important Notes

### Contract Addresses Are Deterministic

Because we use:
1. Same mnemonic
2. Same deployment order
3. Clean Anvil state each time

The contract addresses are **always the same** when you run `pnpm relay:clean` and restart.

### Addresses Persist Between Restarts

If you just use `pnpm relay:stop` and `pnpm relay:start` (without `clean`):
- The Docker volume persists
- Contract addresses stay the same
- Blockchain state is preserved

### When Addresses Change

Contract addresses change only when you:
```bash
pnpm relay:clean  # Removes Docker volumes
pnpm relay:start  # Fresh deployment with new addresses
```

## Viewing Current Configuration

```bash
# Check what's currently deployed
cat .local-relay-config.yaml

# Or directly from Docker volume
docker run --rm -v porto_state:/app alpine cat /app/relay.yaml
```

## Debugging Contract Issues

```bash
# View state container logs (shows deployment)
docker compose logs state

# View all relay logs
pnpm relay:logs

# Check if contracts are accessible
cast call 0xeD1DB453C3156Ff3155a97AD217b3087D5Dc5f6E \
    "name()(string)" \
    --rpc-url http://localhost:9200
```

## Architecture Summary

```
pnpm relay:start
    ↓
Docker Compose
    ↓
State Container (one-time)
    ├─ Starts Anvil
    ├─ Deploys contracts with forge
    ├─ Saves addresses to /app/relay.yaml
    └─ Exits
    ↓
Anvil (port 8545)
    └─ Local blockchain with deployed contracts
    ↓
Proxy (port 9200)
    └─ Forwards requests to Anvil
    ↓
Your App (reads LOCAL_RELAY from .env)
    └─ Connects to http://localhost:9200
```

## Why This Approach?

1. **Reproducible**: Same setup every time
2. **Automated**: No manual configuration needed
3. **Documented**: Config file shows what's deployed
4. **Isolated**: Everything in Docker, no system pollution
5. **Fast**: Contracts deployed once, reused until cleaned

## FAQ

**Q: Can I customize the contract addresses?**  
A: Not directly - they're determined by deployment order. But you can modify the state container's deployment scripts if needed.

**Q: What if I need different contracts?**  
A: Modify `docker/state/Dockerfile` in the Porto repo to deploy additional contracts.

**Q: How do I know which contracts are deployed?**  
A: Check `.local-relay-config.yaml` or run `pnpm relay:status`.

**Q: Can I use these contracts in my tests?**  
A: Yes! The addresses in `.local-relay-config.yaml` are stable between restarts (unless you clean).

