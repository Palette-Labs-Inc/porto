/**
 * Serialization helpers for MMKV storage on React Native
 *
 * Handles BigInt values that JSON.stringify can't serialize natively.
 */

export const replacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') {
    return {
      type: 'BigInt',
      value: value.toString(),
    }
  }
  return value
}

export const reviver = (_key: string, value: any) => {
  if (value && typeof value === 'object' && value.type === 'BigInt') {
    return BigInt(value.value)
  }
  return value
}
