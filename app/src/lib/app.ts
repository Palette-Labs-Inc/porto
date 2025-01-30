import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'
import { createStore } from 'zustand/vanilla'

export const appStore = createStore<appStore.State>(() => ({
  mode: 'popup-standalone',
  referrer: undefined,
}))

export declare namespace appStore {
  type State = {
    mode: 'iframe' | 'popup' | 'popup-standalone'
    referrer:
      | {
          icon?: string | undefined
          origin: URL
          title: string
        }
      | undefined
  }
}

export function useAppStore<slice = appStore.State>(
  selector: Parameters<typeof useStore<typeof appStore, slice>>[1] = (state) =>
    state as slice,
) {
  return useStore(appStore, useShallow(selector))
}
