import type { Hex } from 'ox'
import { useState } from 'react'
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  generatePrivateKey,
  privateKeyToAccount,
  privateKeyToAddress,
} from 'viem/accounts'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

type AccountData = {
  address: string
  privateKey: string
}

type ImportContext = {
  context: unknown
  signPayloads: Hex.Hex[]
}

// Account Generation Hook
function useAccountGenerator() {
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [privateKey, setPrivateKey] = useState<string>('')

  const generateAccount = () => {
    const newPrivateKey = generatePrivateKey()
    setPrivateKey(newPrivateKey)
    setAccountData({
      privateKey: newPrivateKey,
      address: privateKeyToAddress(newPrivateKey),
    })
  }

  return {
    accountData,
    privateKey,
    setPrivateKey,
    generateAccount,
  }
}

// Session Management Hook
function useSessionManager() {
  const [grantSession, setGrantSession] = useState<boolean>(true)

  return {
    grantSession,
    setGrantSession,
  }
}

// Account Import Hook
function useAccountImporter(privateKey: string, grantSession: boolean) {
  const porto = usePorto()
  const [result, setResult] = useState<unknown | null>(null)

  const prepareImport = async (
    account: ReturnType<typeof privateKeyToAccount>,
  ) => {
    const { context, signPayloads } = (await porto.provider.request({
      method: 'experimental_prepareImportAccount',
      params: [{ address: account.address, capabilities: { grantSession } }],
    })) as ImportContext

    return { context, signPayloads }
  }

  const signPayloads = async (
    account: ReturnType<typeof privateKeyToAccount>,
    payloads: `0x${string}`[],
  ) => {
    return Promise.all(payloads.map((hash) => account.sign({ hash })))
  }

  const finalizeImport = async (context: unknown, signatures: string[]) => {
    const address = await porto.provider.request({
      method: 'experimental_importAccount',
      params: [{ context, signatures }],
    })
    setResult(address)
  }

  const handleImport = async () => {
    try {
      const account = privateKeyToAccount(privateKey as Hex.Hex)
      const { context, signPayloads: payloads } = await prepareImport(account)
      const signatures = await signPayloads(account, payloads)
      await finalizeImport(context, signatures)
    } catch (error) {
      console.error('Failed to import account:', error)
    }
  }

  return {
    result,
    handleImport,
  }
}

export function ImportAccount() {
  const { accountData, privateKey, setPrivateKey, generateAccount } =
    useAccountGenerator()
  const { grantSession, setGrantSession } = useSessionManager()
  const { result, handleImport } = useAccountImporter(privateKey, grantSession)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_importAccount</Text>
      <Button onPress={generateAccount} text="Create Account" />
      {accountData && (
        <Text style={styles.codeBlock}>
          {JSON.stringify(accountData, null, 2)}
        </Text>
      )}
      <TextInput
        style={styles.input}
        value={privateKey}
        onChangeText={setPrivateKey}
        placeholder="Private Key"
      />
      <View style={styles.row}>
        <Text>Grant Session</Text>
        <Switch value={grantSession} onValueChange={setGrantSession} />
      </View>
      <Button onPress={handleImport} text="Import Account" />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
})
