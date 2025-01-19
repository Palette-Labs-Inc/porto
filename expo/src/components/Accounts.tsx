import { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

export function Accounts() {
  const porto = usePorto()
  const [result, setResult] = useState<readonly string[] | null>(null)

  useEffect(() => {
    console.info('[PlaygroundScreen:Accounts] result', result)
  }, [result])

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_accounts</Text>
      <Button
        onPress={() =>
          porto.provider.request({ method: 'eth_accounts' }).then(setResult)
        }
        text="Get Accounts"
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
