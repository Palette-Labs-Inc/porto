import { Implementation, Porto } from 'porto'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react'

type PortoInstance = ReturnType<typeof Porto.create>
const PortoContext = createContext<PortoInstance | null>(null)

export function PortoProvider({ children }: { children: ReactNode }) {
  const portoRef = useRef<PortoInstance>(
    Porto.create({
      implementation: Implementation.local({
        keystoreHost: 'mperhats.github.io',
      }),
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
