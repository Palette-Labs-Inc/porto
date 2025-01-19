import { View, Text, StyleSheet, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { usePorto } from '../providers/PortoProvider'

function useEvents() {
  const porto = usePorto()
  const [responses, setResponses] = useState<Record<string, unknown>>({})

  useEffect(() => {
    const handleResponse = (event: string) => (response: unknown) => {
      setResponses((responses) => ({
        ...responses,
        [event]: response,
      }))
    }

    const handleAccountsChanged = handleResponse('accountsChanged')
    const handleChainChanged = handleResponse('chainChanged')
    const handleConnect = handleResponse('connect')
    const handleDisconnect = handleResponse('disconnect')
    const handleMessage = handleResponse('message')

    porto.provider.on('accountsChanged', handleAccountsChanged)
    porto.provider.on('chainChanged', handleChainChanged)
    porto.provider.on('connect', handleConnect)
    porto.provider.on('disconnect', handleDisconnect)
    porto.provider.on('message', handleMessage)

    return () => {
      porto.provider.removeListener('accountsChanged', handleAccountsChanged)
      porto.provider.removeListener('chainChanged', handleChainChanged)
      porto.provider.removeListener('connect', handleConnect)
      porto.provider.removeListener('disconnect', handleDisconnect)
      porto.provider.removeListener('message', handleMessage)
    }
  }, [porto])

  return { responses }
}

export function Events() {
  const { responses } = useEvents()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>Events</Text>
      <Text style={styles.codeBlock}>{JSON.stringify(responses, null, 2)}</Text>
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