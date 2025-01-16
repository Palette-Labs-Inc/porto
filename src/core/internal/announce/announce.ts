import * as Mipd from 'mipd'
import type { Provider } from '../provider'
import type { Announcer } from './types'

export const announcer: Announcer = {
  announce: (provider: Provider) => {
    if (typeof window === 'undefined') return () => {}
    return Mipd.announceProvider({
      info: {
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOEMwIDEyLjQyIDMuNTggMTYgOCAxNkMxMi40MiAxNiAxNiAxMi40MiAxNiA4QzE2IDMuNTggMTIuNDIgMCA4IDBaTTggMTQuNEM0LjQ3IDE0LjQgMS42IDExLjUzIDEuNiA4QzEuNiA0LjQ3IDQuNDcgMS42IDggMS42QzExLjUzIDEuNiAxNC40IDQuNDcgMTQuNCA4QzE0LjQgMTEuNTMgMTEuNTMgMTQuNCA4IDE0LjRaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik04IDQuOEM2LjIzIDQuOCA0LjggNi4yMyA0LjggOEM0LjggOS43NyA2LjIzIDExLjIgOCAxMS4yQzkuNzcgMTEuMiAxMS4yIDkuNzcgMTEuMiA4QzExLjIgNi4yMyA5Ljc3IDQuOCA4IDQuOFoiIGZpbGw9IiMyMTIxMjEiLz4KPC9zdmc+Cg==',
        name: 'Porto',
        rdns: 'xyz.porto',
        uuid: crypto.randomUUID(),
      },
      provider: provider as any,
    })
  },
}