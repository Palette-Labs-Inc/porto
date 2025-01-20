import { Json } from 'ox'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { useSyncExternalStore } from 'react'
import { usePorto } from '../providers/PortoProvider'

export function State() {
  const porto = usePorto()
  const state = useSyncExternalStore(
    porto._internal.store.subscribe,
    () => porto._internal.store.getState(),
    () => porto._internal.store.getState(),
  )

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>State</Text>
      {state.accounts.length === 0 ? (
        <Text>Disconnected</Text>
      ) : (
        <View>
          <Text>Address: {state.accounts[0].address}</Text>
          <Text>Chain ID: {state.chain.id}</Text>
          <Text>Keys:</Text>
          <Text style={styles.codeBlock}>
            {Json.stringify(state.accounts[0].keys, null, 2)}
          </Text>
        </View>
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
