import type { Hex } from 'ox'
import { useState } from 'react'
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { ExperimentERC20 } from '../contracts'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

const callScopes = [
  {
    signature: 'mint(address,uint256)',
    to: ExperimentERC20.address,
  },
] as const

function useAuthorizeKey() {
  const porto = usePorto()
  const [result, setResult] = useState<any | null>(null)
  const [expiry, setExpiry] = useState<string>('') //

  const handleAuthorizeKey = async () => {
    try {
      console.info('[AuthorizeKey] Fetching account')
      const [account] = await porto.provider.request({
        method: 'eth_accounts',
      })

      console.info('[AuthorizeKey] Authorizing key')
      const response = await porto.provider.request({
        method: 'experimental_authorizeKey',
        params: [
          {
            address: account,
            key: {
              callScopes,
              expiry: Math.floor(Date.now() / 1000) + Number(expiry),
            },
          },
        ],
      })
      console.info('[AuthorizeKey] Key authorized:', response)
      setResult(response)
    } catch (error) {
      console.error('[AuthorizeKey] Failed to authorize key:', error)
      throw error
    }
  }

  return {
    result,
    expiry,
    setExpiry,
    handleAuthorizeKey,
  }
}

export function AuthorizeKey() {
  const { result, expiry, setExpiry, handleAuthorizeKey } = useAuthorizeKey()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_authorizeKey</Text>
      <TextInput
        style={styles.input}
        placeholder="expiry (seconds)"
        value={expiry}
        onChangeText={setExpiry}
        keyboardType="numeric"
      />
      <Button onPress={handleAuthorizeKey} text="Authorize Key" />
      {result && (
        <Text style={styles.codeBlock}>{JSON.stringify(result, null, 2)}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
})
