import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

function useDisconnect() {
  const porto = usePorto()

  const handleDisconnect = async () => {
    try {
      console.info('[Disconnect] Disconnecting')
      await porto.provider.request({ method: 'wallet_disconnect' })
      console.info('[Disconnect] Successfully disconnected')
    } catch (error) {
      console.error('[Disconnect] Failed to disconnect:', error)
      throw error
    }
  }

  return {
    handleDisconnect,
  }
}

export function Disconnect() {
  const { handleDisconnect } = useDisconnect()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_disconnect</Text>
      <Button onPress={handleDisconnect} text="Disconnect" />
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
})
