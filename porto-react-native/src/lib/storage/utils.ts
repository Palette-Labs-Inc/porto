/**
 * BigInt serialization helpers for MMKV storage (native platforms)
 *
 * Required for properly storing blockchain-related values that use BigInt.
 * Porto's built-in storage (IndexedDB, localStorage) handles this automatically,
 * but MMKV requires manual serialization.
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
