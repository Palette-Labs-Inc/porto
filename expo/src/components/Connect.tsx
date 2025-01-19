import { View, Text, StyleSheet, Switch, Platform } from 'react-native'
import { useState } from 'react'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

function useConnect() {
  const porto = usePorto()
  const [grantSession, setGrantSession] = useState<boolean>(true)
  const [result, setResult] = useState<unknown | null>(null)

  const handleLogin = async () => {
    const result = await porto.provider.request({
      method: 'experimental_connect',
      params: [{ capabilities: { grantSession } }],
    })
    setResult(result)
  }

  const handleRegister = async () => {
    const result = await porto.provider.request({
      method: 'experimental_connect',
      params: [{ capabilities: { createAccount: true, grantSession } }],
    })
    setResult(result)
  }

  return {
    grantSession,
    setGrantSession,
    result,
    handleLogin,
    handleRegister,
  }
}

export function Connect() {
  const { grantSession, setGrantSession, result, handleLogin, handleRegister } =
    useConnect()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_connect</Text>
      <View style={styles.row}>
        <Text>Grant Session</Text>
        <Switch value={grantSession} onValueChange={setGrantSession} />
      </View>
      <View style={styles.buttonGroup}>
        <Button onPress={handleLogin} text="Login" />
        <Button onPress={handleRegister} text="Register" />
      </View>
      {result ? (
        <Text style={styles.codeBlock}>{JSON.stringify(result, null, 2)}</Text>
      ) : (
        <Text>No result</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
}) 