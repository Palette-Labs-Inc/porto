import { View, Text, StyleSheet } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

export function Disconnect() {
  const porto = usePorto()
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_disconnect</Text>
      <Button
        onPress={() =>
          porto.provider.request({ method: 'experimental_disconnect' })
        }
        text="Disconnect"
      />
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