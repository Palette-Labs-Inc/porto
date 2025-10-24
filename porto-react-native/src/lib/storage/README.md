# Porto Storage

Platform-specific storage implementations for Porto in React Native.

## Architecture

This module uses Metro's platform-specific file resolution to automatically load the correct storage implementation:

```
storage/
├── index.ts           # Barrel export (entry point)
├── storage.native.ts  # iOS/Android implementation (MMKV)
├── storage.ts         # Web implementation (localStorage)
└── utils.ts           # Shared serialization helpers
```

## Platform Resolution

Metro bundler automatically resolves the correct file based on platform:

- **iOS/Android**: `storage.native.ts` → Uses MMKV
- **Web**: `storage.ts` → Uses localStorage (with in-memory fallback)

## Native Storage (MMKV)

**File**: `storage.native.ts`

Uses [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) for maximum performance:

### Features
- **~30x faster** than AsyncStorage
- **Fully synchronous** (no async/await required)
- **High performance** C++ implementation using JSI
- **Encryption support** for secure storage
- **50MB storage limit** (configurable)
- **Web fallback** to LocalStorage/in-memory

### Implementation
```typescript
import { createMMKV } from 'react-native-mmkv'

const mmkv = createMMKV()

export const storage = Storage.from({
  getItem(name) { ... },
  setItem(name, value) { ... },
  removeItem(name) { ... },
  sizeLimit: 1024 * 1024 * 50, // ≈50MB
})
```

## Web Storage

**File**: `storage.ts`

Uses Porto's built-in storage backends with automatic fallback:

### Features
- **IndexedDB** (primary) - ~50MB, best performance
- **localStorage** (fallback) - ~5MB, good compatibility
- **Memory** (last resort) - No persistence
- **Automatic detection** and graceful degradation
- **Zero custom serialization** - Porto handles everything

### Storage Priority
1. **IndexedDB** (`Storage.idb()`) - Default, optimal for web
2. **localStorage** (`Storage.localStorage()`) - Fallback if IndexedDB unavailable
3. **Memory** (`Storage.memory()`) - Last resort if both unavailable

### Why Porto's Built-in Storage?
- **Optimized for blockchain data** - Handles BigInt, large objects
- **Battle-tested** - Used in production Porto applications
- **Automatic serialization** - No manual JSON.stringify/parse needed
- **Better capacity** - IndexedDB: ~50MB vs localStorage: ~5MB
- **Transactional** - IndexedDB provides ACID guarantees

### Implementation
```typescript
export const storage = (() => {
  if (typeof window === 'undefined') {
    return Storage.memory()
  }

  const hasIndexedDB = typeof indexedDB !== 'undefined'
  const hasLocalStorage = // ... test localStorage

  if (hasIndexedDB) return Storage.idb()      // Best
  if (hasLocalStorage) return Storage.localStorage()  // Good
  return Storage.memory()                     // Fallback
})()
```

## Utilities

**File**: `utils.ts`

BigInt serialization helpers for MMKV storage (native platforms only):

### Why Only for Native?
- **Porto's built-in storage** (IndexedDB, localStorage) handles BigInt automatically
- **MMKV** requires manual JSON serialization, so we need custom helpers
- This keeps web storage simple and lets Porto handle serialization optimally

### Functions

#### `replacer(key, value)`
Serializes BigInt values for JSON.stringify on native platforms:
```typescript
const data = { amount: 1000000000000000000n }
JSON.stringify(data, replacer)
// → '{"amount":{"type":"BigInt","value":"1000000000000000000"}}'
```

#### `reviver(key, value)`
Deserializes BigInt values from JSON.parse on native platforms:
```typescript
const json = '{"amount":{"type":"BigInt","value":"1000000000000000000"}}'
JSON.parse(json, reviver)
// → { amount: 1000000000000000000n }
```

## Usage

Import the storage in your Porto configuration:

```typescript
import { Porto } from 'porto'
import { storage } from '#lib/storage'

export const porto = Porto.create({
  // ... other config
  storage, // Automatically uses correct platform implementation
})
```

## Storage Limits

| Platform | Implementation | Size Limit | Persistence | Speed |
|----------|---------------|------------|-------------|-------|
| iOS/Android | MMKV | ~50MB | ✅ Yes | ⚡ ~30x |
| Web (primary) | IndexedDB | ~50MB | ✅ Yes | ⚡ Fast |
| Web (fallback) | localStorage | ~5MB | ✅ Yes | 🐢 Slower |
| Web (last resort) | Memory | Unlimited | ❌ No | ⚡ Fast |

## Troubleshooting

### Data not persisting on web

If data isn't persisting on web, check:
1. Browser console for warning/info messages about storage fallback
2. IndexedDB/localStorage not disabled in browser settings
3. Not in private/incognito mode (some browsers restrict storage)
4. Check browser DevTools → Application → Storage to verify data

### MMKV errors on native

If you see MMKV errors:
1. Ensure `react-native-mmkv` is properly installed
2. Run `pod install` on iOS
3. Rebuild the app (Metro cache may be stale)

## Advanced Usage

### Custom MMKV Instance (Native)

You can customize the MMKV instance in `storage.native.ts`:

```typescript
const mmkv = createMMKV({
  id: 'porto-storage',
  path: `${USER_DIRECTORY}/storage`,
  encryptionKey: 'your-encryption-key',
  mode: 'multi-process',
})
```

### Custom Storage Strategy (Web)

You can customize the web storage strategy in `storage.ts`:

```typescript
// Example: Use only IndexedDB, no fallback
export const storage = Storage.idb()

// Example: Combine multiple storage backends
export const storage = Storage.combine(
  Storage.idb(),        // Primary
  Storage.localStorage(), // Backup
)

// Example: Use cookie storage for cross-domain scenarios
export const storage = Storage.cookie()
```

### Custom Storage Limit (Native)

Adjust the `sizeLimit` in `storage.native.ts`:

```typescript
export const storage = Storage.from({
  // ... other methods
  sizeLimit: 1024 * 1024 * 100, // ≈100MB
})
```

## References

- [Porto Storage API](https://porto.sh/sdk/api/storage)
- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- [Metro Platform-Specific Extensions](https://metrobundler.dev/docs/configuration/#sourceexts)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

