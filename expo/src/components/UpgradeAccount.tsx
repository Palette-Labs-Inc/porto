import type * as Hex from 'ox/Hex'
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
import { ExperimentERC20 } from '../contracts'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

type AccountData = {
  address: string
  privateKey: string
}

const callScopes = [
  {
    signature: 'mint(address,uint256)',
    to: ExperimentERC20.address,
  },
] as const

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

// Key Authorization Hook
function useKeyAuthorization() {
  const [authorizeKey, setAuthorizeKey] = useState<boolean>(true)

  return {
    authorizeKey,
    setAuthorizeKey,
  }
}

// Account Upgrade Hook
function useAccountUpgrade(privateKey: string, authorizeKey: boolean) {
  const porto = usePorto()
  const [result, setResult] = useState<unknown | null>(null)

  const handleUpgrade = async () => {
    try {
      const account = privateKeyToAccount(privateKey as Hex.Hex)

      const { context, signPayloads } = await porto.provider.request({
        method: 'experimental_prepareCreateAccount',
        params: [
          {
            address: account.address,
            capabilities: {
              authorizeKey: authorizeKey ? { callScopes } : undefined,
            },
          },
        ],
      })

      const signatures = await Promise.all(
        signPayloads.map((hash: Hex.Hex) => account.sign({ hash })),
      )

      const address = await porto.provider.request({
        method: 'experimental_createAccount',
        params: [{ context, signatures }],
      })
      setResult(address)
    } catch (error) {
      console.error('Failed to upgrade account:', error)
    }
  }

  return {
    result,
    handleUpgrade,
  }
}

export function UpgradeAccount() {
  const { accountData, privateKey, setPrivateKey, generateAccount } =
    useAccountGenerator()
  const { authorizeKey, setAuthorizeKey } = useKeyAuthorization()
  const { result, handleUpgrade } = useAccountUpgrade(privateKey, authorizeKey)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_createAccount</Text>
      <Button onPress={generateAccount} text="Create EOA" />
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
        <Text>Authorize Key</Text>
        <Switch value={authorizeKey} onValueChange={setAuthorizeKey} />
      </View>
      <Button onPress={handleUpgrade} text="Upgrade EOA to Porto Account" />
      {result ? (
        <Text style={styles.codeBlock}>
          Upgraded account. {JSON.stringify(result, null, 2)}
        </Text>
      ) : null}
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
