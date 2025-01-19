import { useState } from 'react'
import { Platform, StyleSheet, Switch, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

interface ConnectResponse {
  address: string
  chainId: number
}

interface ConnectOptions {
  capabilities: {
    grantSession?: boolean
    createAccount?: boolean
  }
}

function useConnect() {
  const porto = usePorto()
  const [grantSession, setGrantSession] = useState<boolean>(true)
  const [connectResponse, setConnectResponse] =
    useState<ConnectResponse | null>(null)

  const handleConnect = async (shouldCreateAccount: boolean) => {
    try {
      console.info('[Connect] Initiating connection')
      const options: ConnectOptions = {
        capabilities: {
          grantSession,
          ...(shouldCreateAccount && { createAccount: true }),
        },
      }

      console.info('[Connect] Requesting connection with options:', options)
      const response = (await porto.provider.request({
        method: 'experimental_connect',
        params: [options],
      })) as ConnectResponse

      console.info('[Connect] Connection successful:', response)
      setConnectResponse(response)
    } catch (error) {
      console.error('[Connect] Connection failed:', error)
      throw error
    }
  }

  const handleLogin = () => handleConnect(false)
  const handleRegister = () => handleConnect(true)

  return {
    grantSession,
    setGrantSession,
    connectResponse,
    handleLogin,
    handleRegister,
  }
}

export function Connect() {
  const {
    grantSession,
    setGrantSession,
    connectResponse,
    handleLogin,
    handleRegister,
  } = useConnect()

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
      {connectResponse ? (
        <Text style={styles.codeBlock}>
          {JSON.stringify(connectResponse, null, 2)}
        </Text>
      ) : (
        <Text>No connection</Text>
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
