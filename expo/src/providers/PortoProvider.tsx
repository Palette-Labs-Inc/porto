import { Porto } from 'porto'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { Platform } from 'react-native'

type PortoContextType = {
  provider: any
  _internal: any
  destroy?: () => void
}

const PortoContext = createContext<PortoContextType | null>(null)

export function PortoProvider({ children }: { children: ReactNode }) {
  const portoRef = useRef(
    Porto.create({
      keystoreHost: 'mperhats.github.io',
    }),
  )

  useEffect(() => {
    const porto = portoRef.current
    console.info('[Porto] Initialized successfully:', {
      hasProvider: !!porto.provider,
      hasInternal: !!porto._internal,
      hasStore: !!porto._internal?.store,
    })

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
