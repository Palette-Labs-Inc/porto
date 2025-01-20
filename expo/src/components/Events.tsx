import { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import type { RpcSchema } from 'ox'
import type { Schema } from 'porto/core/internal/rpcSchema'

type EventName =
  | 'accountsChanged'
  | 'chainChanged'
  | 'connect'
  | 'disconnect'
  | 'message'

type AccountsChangedEvent = readonly `0x${string}`[]
type ChainChangedEvent = string
type ConnectEvent = { chainId: string }
type DisconnectEvent = { code: number; message: string }
type MessageEvent = { type: string; data: unknown }

interface EventResponses {
  accountsChanged?: AccountsChangedEvent
  chainChanged?: ChainChangedEvent
  connect?: ConnectEvent
  disconnect?: DisconnectEvent
  message?: MessageEvent
}

function useEvents() {
  const porto = usePorto()
  const [responses, setResponses] = useState<EventResponses>({})

  useEffect(() => {
    console.info('[Events] Setting up event listeners')

    const handleAccountsChanged = (accounts: AccountsChangedEvent) => {
      console.info('[Events] Received accountsChanged event:', accounts)
      setResponses((prev) => ({ ...prev, accountsChanged: accounts }))
    }

    const handleChainChanged = (chainId: ChainChangedEvent) => {
      console.info('[Events] Received chainChanged event:', chainId)
      setResponses((prev) => ({ ...prev, chainChanged: chainId }))
    }

    const handleConnect = (connectInfo: ConnectEvent) => {
      console.info('[Events] Received connect event:', connectInfo)
      setResponses((prev) => ({ ...prev, connect: connectInfo }))
    }

    const handleDisconnect = (error: DisconnectEvent) => {
      console.info('[Events] Received disconnect event:', error)
      setResponses((prev) => ({ ...prev, disconnect: error }))
    }

    const handleMessage = (message: MessageEvent) => {
      console.info('[Events] Received message event:', message)
      setResponses((prev) => ({ ...prev, message: message }))
    }

    // Set up event listeners
    porto.provider.on('accountsChanged', handleAccountsChanged)
    porto.provider.on('chainChanged', handleChainChanged)
    porto.provider.on('connect', handleConnect)
    porto.provider.on('disconnect', handleDisconnect)
    porto.provider.on('message', handleMessage)

    // Cleanup function
    return () => {
      console.info('[Events] Cleaning up event listeners')
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
