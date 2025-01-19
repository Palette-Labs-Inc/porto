import { View, Text, StyleSheet, Platform } from 'react-native'
import { useState } from 'react'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

export function GetCapabilities() {
  const porto = usePorto()
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>wallet_getCapabilities</Text>
      <Button
        onPress={() =>
          porto.provider
            .request({ method: 'wallet_getCapabilities' })
            .then(setResult)
        }
        text="Get Capabilities"
      />
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