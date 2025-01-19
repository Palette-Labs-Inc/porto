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

export function ImportAccount() {
  const porto = usePorto()
  const [accountData, setAccountData] = useState<{
    address: string
    privateKey: string
  } | null>(null)
  const [grantSession, setGrantSession] = useState<boolean>(true)
  const [privateKey, setPrivateKey] = useState<string>('')
  const [result, setResult] = useState<unknown | null>(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_importAccount</Text>
      <Button
        onPress={() => {
          const privateKey = generatePrivateKey()
          setPrivateKey(privateKey)
          setAccountData({
            privateKey,
            address: privateKeyToAddress(privateKey),
          })
        }}
        text="Create Account"
      />
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
      <Button
        onPress={async () => {
          const account = privateKeyToAccount(privateKey as Hex.Hex)
          const { context, signPayloads } = await porto.provider.request({
            method: 'experimental_prepareImportAccount',
            params: [
              { address: account.address, capabilities: { grantSession } },
            ],
          })
          const signatures = await Promise.all(
            signPayloads.map((hash: any) => account.sign({ hash })),
          )
          const address = await porto.provider.request({
            method: 'experimental_importAccount',
            params: [{ context, signatures }],
          })
          setResult(address)
        }}
        text="Import Account"
      />
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
