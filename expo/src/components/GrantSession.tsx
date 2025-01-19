import { View, Text, StyleSheet, Platform, TextInput } from 'react-native'
import { useState } from 'react'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'
import type { Hex } from 'ox'

export function GrantSession() {
  const porto = usePorto()
  const [result, setResult] = useState<Hex.Hex | null>(null)
  const [expiry, setExpiry] = useState<string>('')

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_grantSession</Text>
      <TextInput
        style={styles.input}
        placeholder="expiry (seconds)"
        value={expiry}
        onChangeText={setExpiry}
        keyboardType="numeric"
      />
      <Button
        onPress={async () => {
          const [account] = await porto.provider.request({
            method: 'eth_accounts',
          })
          const { id } = await porto.provider.request({
            method: 'experimental_grantSession',
            params: [
              {
                address: account,
                expiry: Math.floor(Date.now() / 1000) + Number(expiry),
              },
            ],
          })
          setResult(id)
        }}
        text="Grant Session"
      />
      {result && <Text style={styles.codeBlock}>session id: {result}</Text>}
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