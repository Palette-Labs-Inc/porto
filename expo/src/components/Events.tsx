import { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'

type EventName =
  | 'accountsChanged'
  | 'chainChanged'
  | 'connect'
  | 'disconnect'
  | 'message'

interface EventResponses {
  accountsChanged?: string[]
  chainChanged?: number
  connect?: { chainId: number }
  disconnect?: { code: number; message: string }
  message?: unknown
}

function useEvents() {
  const porto = usePorto()
  const [responses, setResponses] = useState<EventResponses>({})

  useEffect(() => {
    console.info('[Events] Setting up event listeners')

    const createEventHandler =
      (eventName: EventName) => (response: unknown) => {
        console.info(`[Events] Received ${eventName} event:`, response)
        setResponses((prev) => ({
          ...prev,
          [eventName]: response,
        }))
      }

    const eventHandlers = {
      accountsChanged: createEventHandler('accountsChanged'),
      chainChanged: createEventHandler('chainChanged'),
      connect: createEventHandler('connect'),
      disconnect: createEventHandler('disconnect'),
      message: createEventHandler('message'),
    }

    // Set up event listeners
    for (const [event, handler] of Object.entries(eventHandlers)) {
      porto.provider.on(event as EventName, handler)
    }

    // Cleanup function
    return () => {
      console.info('[Events] Cleaning up event listeners')
      for (const [event, handler] of Object.entries(eventHandlers)) {
        porto.provider.removeListener(event as EventName, handler)
      }
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
