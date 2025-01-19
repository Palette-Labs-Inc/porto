import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

function useAccounts() {
  const porto = usePorto()
  const [accounts, setAccounts] = useState<readonly string[] | null>(null)

  const fetchAccounts = async () => {
    try {
      console.info('[Accounts] Fetching accounts')
      const accounts = await porto.provider.request({ method: 'eth_accounts' })
      console.info('[Accounts] Accounts received:', accounts)
      setAccounts(accounts)
    } catch (error) {
      console.error('[Accounts] Failed to fetch accounts:', error)
      throw error
    }
  }

  return {
    accounts,
    fetchAccounts,
  }
}

export function Accounts() {
  const { accounts, fetchAccounts } = useAccounts()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_accounts</Text>
      <Button onPress={fetchAccounts} text="Get Accounts" />
      {accounts && (
        <Text style={styles.codeBlock}>{JSON.stringify(accounts, null, 2)}</Text>
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
