import { Json, PublicKey } from 'ox'
import { useSyncExternalStore } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'

type AccountKey = {
  expiry: number
  publicKey: { prefix: number; x: bigint; y?: bigint }
  status: string
  type: string
}

type Account = {
  address: string
  keys: AccountKey[]
}

type State = {
  accounts: Account[]
  chain: {
    id: number
  }
}

function usePortoState() {
  const porto = usePorto()

  const state = useSyncExternalStore<State>(
    (callback) => {
      const unsubscribe = porto._internal.store.subscribe(() => {
        callback()
      })
      return () => {
        unsubscribe()
      }
    },
    () => porto._internal.store.getState(),
    () => porto._internal.store.getState(),
  )

  const formatKeys = (account: Account) => {
    return account.keys
      .filter((key) => key.status === 'unlocked')
      .map((key) => ({
        expiry: key.expiry,
        publicKey: PublicKey.toHex(key.publicKey),
        status: key.status,
        type: key.type,
      }))
  }

  return {
    isConnected: state.accounts.length > 0,
    address: state.accounts[0]?.address,
    chainId: state.chain.id,
    formattedKeys: state.accounts[0] ? formatKeys(state.accounts[0]) : [],
  }
}

export function State() {
  const { isConnected, address, chainId, formattedKeys } = usePortoState()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>State</Text>
      {!isConnected ? (
        <Text>Disconnected</Text>
      ) : (
        <View>
          <Text>Address: {address}</Text>
          <Text>Chain ID: {chainId}</Text>
          <Text>Keys:</Text>
          <Text style={styles.codeBlock}>
            {Json.stringify(formattedKeys, null, 2)}
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
