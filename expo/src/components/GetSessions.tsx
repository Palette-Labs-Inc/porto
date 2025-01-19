import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

interface Session {
  id: string
  address: string
  expiry: number
}

function useKeyFetcher() {
  const porto = usePorto()
  const [sessions, setSessions] = useState<Session[]>([])

  const fetchKeys = async () => {
    try {
      console.info('[GetKeys] Fetching keys')
      const result = await porto.provider.request({
        method: 'experimental_keys',
      })
      console.info('[GetKeys] Keys fetched:', result)
      setSessions(result)
    } catch (error) {
      console.error('[GetKeys] Failed to fetch keys:', error)
      throw error
    }
  }

  return {
    sessions,
    fetchKeys,
  }
}

export function GetKeys() {
  const { sessions, fetchKeys } = useKeyFetcher()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_keys</Text>
      <Button onPress={fetchKeys} text="Get Keys" />
      {sessions.length > 0 && (
        <View style={styles.codeBlock}>
          {sessions.map((session, index) => (
            <Text key={session.id} style={styles.sessionText}>
              {index + 1}. id: {session.id}
              {'\n'}
              address: {session.address}
              {'\n'}
              expiry: {session.expiry}
              {'\n'}
            </Text>
          ))}
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
  sessionText: {
    marginBottom: 8,
  },
})
