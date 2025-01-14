import { MMKV } from 'react-native-mmkv'
import type { IStorage } from './types.js'
import type { State } from '../../Porto.js'
import type { PersistStorage } from 'zustand/middleware'

// Initialize MMKV storage
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

export const storage: IStorage = {
  async setItem(name, value) {
    mmkvStorage.set(name, JSON.stringify(value, replacer))
  },
  async getItem(name) {
    const value = mmkvStorage.getString(name)
    return value ? JSON.parse(value, reviver) : null
  },
  async removeItem(name) {
    mmkvStorage.delete(name)
  },
} satisfies PersistStorage<State>