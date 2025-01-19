import { View, Text, StyleSheet, Platform } from 'react-native'
import { useState } from 'react'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

export function Register() {
  const porto = usePorto()
  const [result, setResult] = useState<string | null>(null)

  const handleRegister = async () => {
    console.info('[PlaygroundScreen:Register] Starting registration')
    try {
      const response = await porto.provider.request({
        method: 'experimental_createAccount',
      })
      console.info(
        '[PlaygroundScreen:Register] Registration successful:',
        response,
      )
      setResult(response)
    } catch (error) {
      console.error('[PlaygroundScreen:Register] Registration failed:', error)
      throw error
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_createAccount</Text>
      <Button onPress={handleRegister} text="Register" />
      {result && <Text style={styles.codeBlock}>{result}</Text>}
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