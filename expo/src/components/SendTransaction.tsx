import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

export function SendTransaction() {
  const porto = usePorto()
  const [result, setResult] = useState<string | null>(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_sendTransaction</Text>
      <Button
        onPress={async () => {
          const [account] = await porto.provider.request({
            method: 'eth_accounts',
          })
          const result = await porto.provider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: account,
                to: '0x0000000000000000000000000000000000000000',
                value: '0x0',
                data: '0x',
              },
            ],
          })
          setResult(result)
        }}
        text="Send Transaction"
      />
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
