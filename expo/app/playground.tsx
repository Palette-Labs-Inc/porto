import { ExperimentERC20 } from '@/src/contracts'
import { Stack } from 'expo-router'
import { AbiFunction, Hex, Json, PublicKey, TypedData, Value } from 'ox'
import { Porto } from 'porto'
import * as React from 'react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { createClient, custom } from 'viem'
import {
  generatePrivateKey,
  privateKeyToAccount,
  privateKeyToAddress,
} from 'viem/accounts'
import { verifyMessage, verifyTypedData } from 'viem/actions'

let porto: { provider: any; _internal: any; destroy?: () => void }
try {
  console.info(
    '[PlaygroundScreen] Starting Porto initialization with config:',
    {
      keystoreHost: 'mperhats.github.io',
      platform: Platform.OS,
    },
  )
  porto = Porto.create({
    keystoreHost: 'mperhats.github.io',
  })
  console.info('[PlaygroundScreen] Porto initialized successfully:', {
    hasProvider: !!porto.provider,
    hasInternal: !!porto._internal,
    hasStore: !!porto._internal?.store,
  })
} catch (error) {
  console.error('[PlaygroundScreen] Failed to initialize Porto:', error)
  throw error
}

const client = createClient({
  transport: custom(porto.provider),
})

// Custom Button component to replace @repo/ui Button
function Button({
  onPress,
  text,
  variant = 'primary',
}: { onPress: () => void; text: string; variant?: 'primary' | 'secondary' }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'primary'
            ? styles.buttonTextPrimary
            : styles.buttonTextSecondary,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  )
}

export default function PlaygroundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Porto Playground' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Porto Playground</Text>
        <State />
        <Events />
        <Connect />
        <Register />
        <ImportAccount />
        <Login />
        <Disconnect />
        <Accounts />
        <GetCapabilities />
        <GrantSession />
        <GetSessions />
        <SendCalls />
        <SendTransaction />
        <SignMessage />
        <SignTypedData />
      </ScrollView>
    </>
  )
}

function State() {
  const state = useSyncExternalStore(
    (callback) => {
      const unsubscribe = porto._internal.store.subscribe(() => {
        const newState = porto._internal.store.getState()
        callback()
      })
      return () => {
        unsubscribe()
      }
    },
    () => {
      const state = porto._internal.store.getState()
      return state
    },
    () => porto._internal.store.getState(),
  )

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>State</Text>
      {state.accounts.length === 0 ? (
        <Text>Disconnected</Text>
      ) : (
        <View>
          <Text>Address: {state.accounts[0].address}</Text>
          <Text>Chain ID: {state.chain.id}</Text>
          <Text>Keys:</Text>
          <Text style={styles.codeBlock}>
            {Json.stringify(
              state.accounts?.[0]?.keys
                .filter((x: { status: string }) => x.status === 'unlocked')
                .map(
                  (x: {
                    expiry: any
                    publicKey:
                      | { prefix: number; x: bigint; y: bigint }
                      | { prefix: number; x: bigint; y?: undefined }
                    status: any
                    type: any
                  }) => ({
                    expiry: x.expiry,
                    publicKey: PublicKey.toHex(x.publicKey),
                    status: x.status,
                    type: x.type,
                  }),
                ),
              null,
              2,
            )}
          </Text>
        </View>
      )}
    </View>
  )
}

function Events() {
  const [responses, setResponses] = useState<Record<string, unknown>>({})

  useEffect(() => {
    const handleResponse = (event: string) => (response: unknown) => {
      setResponses((responses) => ({
        ...responses,
        [event]: response,
      }))
    }

    const handleAccountsChanged = handleResponse('accountsChanged')
    const handleChainChanged = handleResponse('chainChanged')
    const handleConnect = handleResponse('connect')
    const handleDisconnect = handleResponse('disconnect')
    const handleMessage = handleResponse('message')

    porto.provider.on('accountsChanged', handleAccountsChanged)
    porto.provider.on('chainChanged', handleChainChanged)
    porto.provider.on('connect', handleConnect)
    porto.provider.on('disconnect', handleDisconnect)
    porto.provider.on('message', handleMessage)

    return () => {
      porto.provider.removeListener('accountsChanged', handleAccountsChanged)
      porto.provider.removeListener('chainChanged', handleChainChanged)
      porto.provider.removeListener('connect', handleConnect)
      porto.provider.removeListener('disconnect', handleDisconnect)
      porto.provider.removeListener('message', handleMessage)
    }
  }, [])

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>Events</Text>
      <Text style={styles.codeBlock}>{JSON.stringify(responses, null, 2)}</Text>
    </View>
  )
}

function Connect() {
  const [grantSession, setGrantSession] = useState<boolean>(true)
  const [result, setResult] = useState<unknown | null>(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_connect</Text>
      <View style={styles.row}>
        <Text>Grant Session</Text>
        <Switch value={grantSession} onValueChange={setGrantSession} />
      </View>
      <View style={styles.buttonGroup}>
        <Button
          onPress={() =>
            porto.provider
              .request({
                method: 'experimental_connect',
                params: [{ capabilities: { grantSession } }],
              })
              .then(setResult)
          }
          text="Login"
        />
        <Button
          onPress={() =>
            porto.provider
              .request({
                method: 'experimental_connect',
                params: [
                  { capabilities: { createAccount: true, grantSession } },
                ],
              })
              .then(setResult)
          }
          text="Register"
        />
      </View>
      {result ? (
        <Text style={styles.codeBlock}>{JSON.stringify(result, null, 2)}</Text>
      ) : (
        <Text>No result</Text>
      )}
    </View>
  )
}

function Register() {
  const [result, setResult] = useState<string | null>(null)

  const handleRegister = async () => {
    console.info('[PlaygroundScreen:Register] Starting registration')
    try {
      const response = await porto.provider.request({
        method: 'experimental_createAccount',
      })
      console.info(
        '[PlaygroundScreen:Register] Registration successful:',
        response,
      )
      setResult(response)
    } catch (error) {
      console.error('[PlaygroundScreen:Register] Registration failed:', error)
      throw error
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_createAccount</Text>
      <Button onPress={handleRegister} text="Register" />
      {result && <Text style={styles.codeBlock}>{result}</Text>}
    </View>
  )
}

function ImportAccount() {
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

function Login() {
  const [result, setResult] = useState<readonly string[] | null>(null)

  const handleLogin = async () => {
    try {
      const accounts = await porto.provider.request({
        method: 'eth_requestAccounts',
      })
      setResult(accounts)
    } catch (error) {
      console.error('[PlaygroundScreen:Login] Login failed:', error)
      throw error
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_requestAccounts</Text>
      <Button onPress={handleLogin} text="Login" />
      {result && (
        <Text style={styles.codeBlock}>{JSON.stringify(result, null, 2)}</Text>
      )}
    </View>
  )
}

function Disconnect() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_disconnect</Text>
      <Button
        onPress={() =>
          porto.provider.request({ method: 'experimental_disconnect' })
        }
        text="Disconnect"
      />
    </View>
  )
}

function Accounts() {
  const [result, setResult] = useState<readonly string[] | null>(null)

  useEffect(() => {
    console.info('[PlaygroundScreen:Accounts] result', result)
  }, [result])

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_accounts</Text>
      <Button
        onPress={() =>
          porto.provider.request({ method: 'eth_accounts' }).then(setResult)
        }
        text="Get Accounts"
      />
      {result && (
        <Text style={styles.codeBlock}>{JSON.stringify(result, null, 2)}</Text>
      )}
    </View>
  )
}

function GetCapabilities() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>wallet_getCapabilities</Text>
      <Button
        onPress={() =>
          porto.provider
            .request({ method: 'wallet_getCapabilities' })
            .then(setResult)
        }
        text="Get Capabilities"
      />
      {result && (
        <Text style={styles.codeBlock}>{JSON.stringify(result, null, 2)}</Text>
      )}
    </View>
  )
}

function GrantSession() {
  const [result, setResult] = useState<Hex.Hex | null>(null)
  const [expiry, setExpiry] = useState<string>('')

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_grantSession</Text>
      <TextInput
        style={styles.input}
        placeholder="expiry (seconds)"
        value={expiry}
        onChangeText={setExpiry}
        keyboardType="numeric"
      />
      <Button
        onPress={async () => {
          const [account] = await porto.provider.request({
            method: 'eth_accounts',
          })
          const { id } = await porto.provider.request({
            method: 'experimental_grantSession',
            params: [
              {
                address: account,
                expiry: Math.floor(Date.now() / 1000) + Number(expiry),
              },
            ],
          })
          setResult(id)
        }}
        text="Grant Session"
      />
      {result && <Text style={styles.codeBlock}>session id: {result}</Text>}
    </View>
  )
}

function GetSessions() {
  const [result, setResult] = useState<unknown>(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>experimental_sessions</Text>
      <Button
        onPress={() =>
          porto.provider
            .request({ method: 'experimental_sessions' })
            .then(setResult)
        }
        text="Get Sessions"
      />
      {result ? (
        <Text style={styles.codeBlock}>{JSON.stringify(result, null, 2)}</Text>
      ) : (
        <Text>No result</Text>
      )}
    </View>
  )
}

function SendCalls() {
  const [hash, setHash] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<string>('mint')

  const callOptions = [
    { id: 'mint', label: 'Mint 100 EXP' },
    { id: 'approve-transfer', label: 'Approve + Transfer 50 EXP' },
    { id: 'noop', label: 'Noop Calls' },
  ]

  const handleSendCalls = async () => {
    const [account] = await porto.provider.request({
      method: 'eth_accounts',
    })

    const calls = (() => {
      if (selectedAction === 'mint')
        return [
          {
            to: ExperimentERC20.address,
            data: AbiFunction.encodeData(
              AbiFunction.fromAbi(ExperimentERC20.abi, 'mint'),
              [account, Value.fromEther('100')],
            ),
          },
        ]

      if (selectedAction === 'approve-transfer')
        return [
          {
            to: ExperimentERC20.address,
            data: AbiFunction.encodeData(
              AbiFunction.fromAbi(ExperimentERC20.abi, 'approve'),
              [account, Value.fromEther('50')],
            ),
          },
          {
            to: ExperimentERC20.address,
            data: AbiFunction.encodeData(
              AbiFunction.fromAbi(ExperimentERC20.abi, 'transferFrom'),
              [
                account,
                '0x0000000000000000000000000000000000000000',
                Value.fromEther('50'),
              ],
            ),
          },
        ]

      return [
        {
          data: '0xdeadbeef',
          to: '0x0000000000000000000000000000000000000000',
        },
        {
          data: '0xcafebabe',
          to: '0x0000000000000000000000000000000000000000',
        },
      ]
    })()

    const hash = await porto.provider.request({
      method: 'wallet_sendCalls',
      params: [
        {
          calls,
          from: account,
          version: '1',
        },
      ],
    })
    setHash(hash)
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>wallet_sendCalls</Text>
      <View style={styles.optionsContainer}>
        {callOptions.map((option) => (
          <Pressable
            key={option.id}
            style={styles.checkboxContainer}
            onPress={() => setSelectedAction(option.id)}
          >
            <View style={styles.checkbox}>
              {selectedAction === option.id && (
                <View style={styles.checkboxInner} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <Button onPress={handleSendCalls} text="Send" />
      {hash && <Text style={styles.codeBlock}>{hash}</Text>}
    </View>
  )
}

function SendTransaction() {
  const [hash, setHash] = useState<Hex.Hex | null>(null)
  const [selectedAction, setSelectedAction] = useState<string>('mint')

  const transactionOptions = [
    { id: 'mint', label: 'Mint 100 EXP' },
    { id: 'noop', label: 'Noop' },
  ]

  const handleSendTransaction = async () => {
    const [account] = await porto.provider.request({
      method: 'eth_accounts',
    })

    const params = (() => {
      if (selectedAction === 'mint')
        return [
          {
            from: account,
            to: ExperimentERC20.address,
            data: AbiFunction.encodeData(
              AbiFunction.fromAbi(ExperimentERC20.abi, 'mint'),
              [account, Value.fromEther('100')],
            ),
          },
        ]

      return [
        {
          from: account,
          to: '0x0000000000000000000000000000000000000000',
          data: '0xdeadbeef',
        },
      ]
    })()

    const hash = await porto.provider.request({
      method: 'eth_sendTransaction',
      params,
    })
    setHash(hash)
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_sendTransaction</Text>
      <View style={styles.optionsContainer}>
        {transactionOptions.map((option) => (
          <Pressable
            key={option.id}
            style={styles.checkboxContainer}
            onPress={() => setSelectedAction(option.id)}
          >
            <View style={styles.checkbox}>
              {selectedAction === option.id && (
                <View style={styles.checkboxInner} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <Button onPress={handleSendTransaction} text="Send" />
      {hash && <Text style={styles.codeBlock}>{hash}</Text>}
    </View>
  )
}

function SignMessage() {
  const [signature, setSignature] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('hello world')
  const [valid, setValid] = useState<boolean | null>(null)
  const [messageToVerify, setMessageToVerify] = useState<string>('')
  const [verifySignature, setVerifySignature] = useState<string>('')

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>personal_sign</Text>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Message to sign"
      />
      <Button
        onPress={async () => {
          const [account] = await porto.provider.request({
            method: 'eth_accounts',
          })
          const result = await porto.provider.request({
            method: 'personal_sign',
            params: [Hex.fromString(message), account],
          })
          setSignature(result)
        }}
        text="Sign"
      />
      {signature && <Text style={styles.codeBlock}>{signature}</Text>}

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Verify Message</Text>
        <TextInput
          style={styles.input}
          value={messageToVerify}
          onChangeText={setMessageToVerify}
          placeholder="Message"
        />
        <TextInput
          style={styles.input}
          value={verifySignature}
          onChangeText={setVerifySignature}
          placeholder="Signature"
        />
        <Button
          onPress={async () => {
            const [account] = await porto.provider.request({
              method: 'eth_accounts',
            })
            const valid = await verifyMessage(client, {
              address: account,
              message: messageToVerify,
              signature: verifySignature as `0x${string}`,
            })
            setValid(valid)
          }}
          text="Verify"
        />
        {valid !== null && (
          <Text style={valid ? styles.successText : styles.errorText}>
            {valid ? 'Valid signature' : 'Invalid signature'}
          </Text>
        )}
      </View>
    </View>
  )
}

function SignTypedData() {
  const [signature, setSignature] = useState<string | null>(null)
  const [valid, setValid] = useState<boolean | null>(null)
  const [verifySignature, setVerifySignature] = useState<string>('')

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_signTypedData_v4</Text>
      <Button
        onPress={async () => {
          const [account] = await porto.provider.request({
            method: 'eth_accounts',
          })
          const result = await porto.provider.request({
            method: 'eth_signTypedData_v4',
            params: [account, TypedData.serialize(typedData)],
          })
          setSignature(result)
        }}
        text="Sign"
      />
      {signature && <Text style={styles.codeBlock}>{signature}</Text>}

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Verify Typed Data</Text>
        <TextInput
          style={styles.input}
          value={verifySignature}
          onChangeText={setVerifySignature}
          placeholder="Signature"
        />
        <Button
          onPress={async () => {
            const [account] = await porto.provider.request({
              method: 'eth_accounts',
            })
            const valid = await verifyTypedData(client, {
              ...typedData,
              address: account,
              signature: verifySignature as `0x${string}`,
            })
            setValid(valid)
          }}
          text="Verify"
        />
        {valid !== null && (
          <Text style={valid ? styles.successText : styles.errorText}>
            {valid ? 'Valid signature' : 'Invalid signature'}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
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
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextPrimary: {
    color: 'white',
  },
  buttonTextSecondary: {
    color: '#2196F3',
  },
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  checkboxLabel: {
    fontSize: 16,
  },
})

const typedData = {
  domain: {
    name: 'Ether Mail 🥵',
    version: '1.1.1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  },
  types: {
    Name: [
      { name: 'first', type: 'string' },
      { name: 'last', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'Name' },
      { name: 'wallet', type: 'address' },
      { name: 'favoriteColors', type: 'string[3]' },
      { name: 'foo', type: 'uint256' },
      { name: 'age', type: 'uint8' },
      { name: 'isCool', type: 'bool' },
    ],
    Mail: [
      { name: 'timestamp', type: 'uint256' },
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
      { name: 'hash', type: 'bytes' },
    ],
  },
  primaryType: 'Mail',
  message: {
    timestamp: 1234567890n,
    contents: 'Hello, Bob! 🖤',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    from: {
      name: {
        first: 'Cow',
        last: 'Burns',
      },
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      age: 69,
      foo: 123123123123123123n,
      favoriteColors: ['red', 'green', 'blue'],
      isCool: false,
    },
    to: {
      name: { first: 'Bob', last: 'Builder' },
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      age: 70,
      foo: 123123123123123123n,
      favoriteColors: ['orange', 'yellow', 'green'],
      isCool: true,
    },
  },
} as const
