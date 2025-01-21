import { Implementation, Porto, Storage } from 'porto'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react'

import { MMKV } from 'react-native-mmkv'

type PortoInstance = ReturnType<typeof Porto.create>
const PortoContext = createContext<PortoInstance | null>(null)

const mmkvStorage = new MMKV()

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

const createMMKVStorage = (storage: MMKV) =>
  Storage.from({
    getItem: (key) => {
      const value = storage.getString(key)
      return value ? JSON.parse(value, reviver) : null
    },
    setItem: (key, value) => {
      storage.set(key, JSON.stringify(value, replacer))
    },
    removeItem: (key) => {
      storage.delete(key)
    },
  })

export function PortoProvider({ children }: { children: ReactNode }) {
  const portoRef = useRef<PortoInstance>(
    Porto.create({
      implementation: Implementation.local({
        keystoreHost: 'mperhats.github.io',
      }),
      storage: createMMKVStorage(mmkvStorage),
    }),
  )

  useEffect(() => {
    const porto = portoRef.current
    return () => {
      porto.destroy?.()
    }
  }, [])

  return (
    <PortoContext.Provider value={portoRef.current}>
      {children}
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

// Export the Porto type for convenience
export type { Porto }
