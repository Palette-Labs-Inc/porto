import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

type Capabilities = Record<string, unknown>

function useCapabilities() {
  const porto = usePorto()
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null)

  const fetchCapabilities = async () => {
    try {
      console.info('[GetCapabilities] Fetching capabilities')
      const capabilities = await porto.provider.request({
        method: 'wallet_getCapabilities',
      })
      console.info('[GetCapabilities] Capabilities received:', capabilities)
      setCapabilities(capabilities)
    } catch (error) {
      console.error('[GetCapabilities] Failed to fetch capabilities:', error)
      throw error
    }
  }

  return {
    capabilities,
    fetchCapabilities,
  }
}

export function GetCapabilities() {
  const { capabilities, fetchCapabilities } = useCapabilities()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>wallet_getCapabilities</Text>
      <Button onPress={fetchCapabilities} text="Get Capabilities" />
      {capabilities && (
        <Text style={styles.codeBlock}>
          {JSON.stringify(capabilities, null, 2)}
        </Text>
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
