import { Implementation, Porto, Storage } from 'porto'
import { type ReactNode, createContext, useContext } from 'react'
import { Platform } from 'react-native'
import { MMKV } from 'react-native-mmkv'
import { type Client, createClient, custom } from 'viem'

type PortoInstance = ReturnType<typeof Porto.create>
const PortoContext = createContext<PortoInstance | null>(null)
const ClientContext = createContext<Client | null>(null)

// Add BigInt serialization helpers
const replacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') {
    return {
      type: 'BigInt',
      value: value.toString(),
    }
  }
  return value
}

const reviver = (_key: string, value: any) => {
  if (value && typeof value === 'object' && value.type === 'BigInt') {
    return BigInt(value.value)
  }
  return value
}

// Create native storage only
const createNativeStorage = () => {
  const mmkvStorage = new MMKV()
  return Storage.from({
    getItem: (key) => {
      const value = mmkvStorage.getString(key)
      return value ? JSON.parse(value, reviver) : null
    },
    setItem: (key, value) => {
      mmkvStorage.set(key, JSON.stringify(value, replacer))
    },
    removeItem: (key) => mmkvStorage.delete(key),
  })
}

// Create Porto instance at module level
const porto: PortoInstance = Porto.create({
  implementation: Implementation.local({
    keystoreHost: 'mperhats.github.io',
  }),
  // Only provide storage for native platforms, else use default storage
  ...(Platform.OS !== 'web' && { storage: createNativeStorage() })
})

// Create viem client at module level
const client = createClient({
  transport: custom(porto.provider),
})

export function PortoProvider({ children }: { children: ReactNode }) {
  return (
    <PortoContext.Provider value={porto}>
      <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
    </PortoContext.Provider>
  )
}

export function usePorto() {
  const context = useContext(PortoContext)
  if (!context) {
    throw new Error('usePorto must be used within a PortoProvider')
  }
  return context
}

export function useClient() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClient must be used within a PortoProvider')
  }
  return context
}

// Export the Porto type for convenience
export type { Porto }
