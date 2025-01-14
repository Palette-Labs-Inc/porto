import type { PersistStorage } from 'zustand/middleware'
import type { State } from '../../Porto.js'

export interface IStorage extends PersistStorage<State> {
  getItem: (name: string) => Promise<any>
  setItem: (name: string, value: any) => Promise<void>
  removeItem: (name: string) => Promise<void>
}