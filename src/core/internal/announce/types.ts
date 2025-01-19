import type { Provider } from '../provider.js'

export interface Announcer {
  announce: (provider: Provider) => () => void
}