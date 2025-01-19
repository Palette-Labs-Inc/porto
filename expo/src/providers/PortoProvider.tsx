import { Porto } from 'porto'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react'

type PortoContextType = {
  provider: any
  _internal: any
  destroy?: () => void
}

const PortoContext = createContext<PortoContextType | null>(null)

export function PortoProvider({ children }: { children: ReactNode }) {
  const portoRef = useRef(
    Porto.create({
      keystoreHost: 'mperhats.github.io', // TODO, add to env and use here and in app.config.ts
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