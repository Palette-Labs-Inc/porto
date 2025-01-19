import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

function useLogin() {
  const porto = usePorto()
  const [accounts, setAccounts] = useState<readonly string[] | null>(null)

  const handleLogin = async () => {
    try {
      console.info('[Login] Requesting accounts')
      const accounts = await porto.provider.request({
        method: 'eth_requestAccounts',
      })
      console.info('[Login] Accounts received:', accounts)
      setAccounts(accounts)
    } catch (error) {
      console.error('[Login] Login failed:', error)
      throw error
    }
  }

  return {
    accounts,
    handleLogin,
  }
}

export function Login() {
  const { accounts, handleLogin } = useLogin()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_requestAccounts</Text>
      <Button onPress={handleLogin} text="Login" />
      {accounts && (
        <Text style={styles.codeBlock}>
          {JSON.stringify(accounts, null, 2)}
        </Text>
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
