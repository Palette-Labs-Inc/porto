import { View, Text, StyleSheet, Platform } from 'react-native'
import { useState } from 'react'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

export function Login() {
  const porto = usePorto()
  const [result, setResult] = useState<readonly string[] | null>(null)

  const handleLogin = async () => {
    try {
      const accounts = await porto.provider.request({
        method: 'eth_requestAccounts',
      })
      setResult(accounts)
    } catch (error) {
      console.error('[PlaygroundScreen:Login] Login failed:', error)
      throw error
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_requestAccounts</Text>
      <Button onPress={handleLogin} text="Login" />
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
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
}) 