import { Json, PublicKey } from 'ox'
import { useSyncExternalStore } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'

export function State() {
  const porto = usePorto()
  const state = useSyncExternalStore(
    (callback) => {
      const unsubscribe = porto._internal.store.subscribe(() => {
        callback()
      })
      return () => {
        unsubscribe()
      }
    },
    () => {
      const state = porto._internal.store.getState()
      return state
    },
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
            {Json.stringify(
              state.accounts?.[0]?.keys
                .filter((x: { status: string }) => x.status === 'unlocked')
                .map(
                  (x: {
                    expiry: any
                    publicKey:
                      | { prefix: number; x: bigint; y: bigint }
                      | { prefix: number; x: bigint; y?: undefined }
                    status: any
                    type: any
                  }) => ({
                    expiry: x.expiry,
                    publicKey: PublicKey.toHex(x.publicKey),
                    status: x.status,
                    type: x.type,
                  }),
                ),
              null,
              2,
            )}
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
