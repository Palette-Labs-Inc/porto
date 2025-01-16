import type { Provider } from '../provider'

export interface Announcer {
  announce: (provider: Provider) => () => void
}
