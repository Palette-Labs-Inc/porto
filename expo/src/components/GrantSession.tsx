import type { Hex } from 'ox'
import { useState } from 'react'
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

function useSessionGrant() {
  const porto = usePorto()
  const [sessionId, setSessionId] = useState<Hex.Hex | null>(null)
  const [expiry, setExpiry] = useState<string>('')

  const grantSession = async () => {
    try {
      console.info('[AuthorizeKey] Fetching account')
      const [account] = await porto.provider.request({
        method: 'eth_accounts',
      })

      console.info('[AuthorizeKey] Authorizing key')
      const result = await porto.provider.request({
        method: 'experimental_authorizeKey',
        params: [
          {
            address: account,
            key: {
              expiry: Math.floor(Date.now() / 1000) + Number(expiry),
            },
          },
        ],
      })
      console.info('[AuthorizeKey] Key authorized:', result)
      setSessionId(result)
    } catch (error) {
      console.error('[AuthorizeKey] Failed to authorize key:', error)
      throw error
    }
  }

  return {
    sessionId,
    expiry,
    setExpiry,
    grantSession,
  }
}

export function GrantSession() {
  const { sessionId, expiry, setExpiry, grantSession } = useSessionGrant()

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
      <Button onPress={grantSession} text="Authorize Key" />
      {sessionId && <Text style={styles.codeBlock}>key: {sessionId}</Text>}
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
