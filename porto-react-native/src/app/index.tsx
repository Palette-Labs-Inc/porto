// Porto React Native Playground - Mode.relay
// This app uses Mode.relay() which communicates directly with the Porto Relay.
//
// Mode.relay handles account management, signing, and execution by coordinating
// between the app and the Porto Relay infrastructure. It uses WebAuthn for
// secure key management and supports all standard EIP-1193 methods plus Porto
// extensions like permissions management and batch transactions.

// Workspace-local import to call the native module directly
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ExpoWebAuthN from '@porto/expo-webauthn/src/ExpoWebAuthN'
import { Checkbox } from 'expo-checkbox'
import * as ExpoCrypto from 'expo-crypto'
import { Link } from 'expo-router'
import { AbiFunction, Base64, Hex, Json, Value } from 'ox'
import * as React from 'react'
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { exp1Abi, exp1Address, exp2Address } from '#lib/_generated/contracts.ts'
import { permissions, porto } from '#lib/porto.ts'

export default function Page() {
  return (
    <SafeAreaProvider style={styles.safeAreaProvider}>
      <SafeAreaView>
        <ScrollView>
          <Link
            href="https://porto.sh/sdk/api/mode#modereactnative"
            style={styles.link}
          >
            Porto React Native API Reference
          </Link>
          <View>
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}
            >
              Account Management
            </Text>
            <Connect />
            <Login />
            <Divider />
            <GetCapabilities />
            <AddFaucetFunds />
            <Divider />
            <GetAssets />
            <Accounts />
            <Disconnect />
            <GetAccountVersion />
            <Divider />
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}
            >
              Chain Management
            </Text>
            <SwitchChain />
            <Divider />
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}
            >
              Permissions
            </Text>
            <GrantPermissions />
            <GetPermissions />
            <RevokePermissions />
            <Divider />
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}
            >
              Admins
            </Text>
            <MintEXP2 />
            <GrantAdmin />
            <GetAdmins />
            <RevokeAdmin />
            <Divider />
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}
            >
              Actions
            </Text>
            <SendCalls />
            <SendTransaction />
            <SignMessage />
            <SignTypedMessage />
            <Divider />
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}
            >
              Misc.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

function Divider() {
  return (
    <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 12 }} />
  )
}

function Pre(props: { text?: unknown }) {
  if (!props.text) return null
  return (
    <View style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
      <Text style={{ fontSize: 14, color: '#666', fontFamily: 'monospace' }}>
        {Json.stringify(props.text, null, 2)}
      </Text>
    </View>
  )
}

function Connect() {
  const [email, setEmail] = React.useState<boolean>(true)
  const [grantPermissions, setGrantPermissions] = React.useState<boolean>(true)
  const [result, setResult] = React.useState<unknown | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <Text>wallet_connect</Text>
      <View>
        <Button
          onPress={async () => {
            const payload = {
              capabilities: {
                createAccount: false,
                email,
                grantPermissions: grantPermissions ? permissions() : undefined,
              },
            } as const
            return porto.provider
              .request({
                method: 'wallet_connect',
                params: [payload],
              })
              .then(setResult)
              .catch((error) => {
                console.info(payload)
                console.error(error)
                setError(
                  Json.stringify({ error: error.message, payload }, null, 2),
                )
              })
          }}
          title="Login"
        />
        <Divider />
        <Button
          title="Register"
          onPress={async () => {
            const payload = {
              capabilities: {
                createAccount: true,
                email,
                grantPermissions: grantPermissions ? permissions() : undefined,
              },
            } as const
            return porto.provider
              .request({
                method: 'wallet_connect',
                params: [payload],
              })
              .then(setResult)
              .catch((error) => {
                console.info(payload)
                console.error(error?.message)
                setError(
                  Json.stringify({ error: error.message, payload }, null, 2),
                )
              })
          }}
        />
      </View>

      <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Checkbox value={email} onValueChange={() => setEmail((x) => !x)} />
          <Text>Email</Text>
        </View>

        <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Checkbox
            value={grantPermissions}
            onValueChange={() => setGrantPermissions((x) => !x)}
          />
          <Text>Grant Permissions</Text>
        </View>
      </View>
      <Pre text={result} />
      <Pre text={error} />
    </View>
  )
}

function Login() {
  const [result, setResult] = React.useState<readonly string[] | null>(null)

  return (
    <View>
      <Text>eth_requestAccounts</Text>
      <Button
        onPress={() =>
          porto.provider
            .request({ method: 'eth_requestAccounts' })
            .then(setResult)
        }
        title="Login"
      />
      <Pre text={result} />
    </View>
  )
}

function AddFaucetFunds() {
  const [result, setResult] = React.useState<unknown | null>(null)
  const [loading, setLoading] = React.useState(false)

  return (
    <View>
      <Text>wallet_addFaucetFunds (Dev Faucet)</Text>
      <Text style={{ fontSize: 12, color: '#666', marginVertical: 4 }}>
        Request 25 EXP tokens from Porto's development faucet (Base Sepolia)
      </Text>
      <Button
        disabled={loading}
        onPress={async () => {
          setLoading(true)
          setResult(null)
          try {
            const accounts = await porto.provider.request({
              method: 'eth_accounts',
            })
            if (!accounts[0]) {
              setResult({ error: 'Please connect first' })
              return
            }

            const chainId = Hex.toNumber(
              await porto.provider.request({
                method: 'eth_chainId',
              }),
            )

            // Token addresses for faucet (from capabilities response)
            const faucetTokens: Record<
              number,
              { address: string; symbol: string }
            > = {
              84532: {
                // Base Sepolia - using EXP token
                address: '0xfca413a634c4df6b98ebb970a44d9a32f8f5c64e',
                symbol: 'EXP',
              },
              11155420: {
                // Optimism Sepolia - needs to be confirmed
                address: '0x6795f10304557a454b94a5c04e9217677cc9b598',
                symbol: 'TETH',
              },
            }

            const token = faucetTokens[chainId]
            if (!token) {
              setResult({
                error: `Faucet not available on this chain (${chainId})`,
                hint: 'Switch to Base Sepolia (84532) or Optimism Sepolia (11155420)',
              })
              return
            }

            // Call Porto RPC directly (not through provider)
            const response = await fetch('https://rpc.porto.sh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'wallet_addFaucetFunds',
                params: [
                  {
                    address: accounts[0],
                    chainId,
                    tokenAddress: token.address,
                    value: 25, // Default amount from docs
                  },
                ],
              }),
            })

            const faucetResult = await response.json()

            if (faucetResult.error) {
              console.error('Faucet error:', faucetResult.error)
              throw new Error(
                faucetResult.error.message ||
                  JSON.stringify(faucetResult.error),
              )
            }
            setResult({
              success: true,
              message:
                faucetResult.result?.message ||
                'Faucet funds requested! 25 EXP tokens should arrive shortly.',
              transactionHash: faucetResult.result?.transactionHash,
              details: faucetResult.result,
            })
          } catch (error: any) {
            console.error('wallet_addFaucetFunds error:', error)
            setResult({
              error: error?.message || String(error),
              hint: 'Ensure you are on Base Sepolia and not rate limited.',
            })
          } finally {
            setLoading(false)
          }
        }}
        title={loading ? 'Requesting...' : 'Request 25 EXP from Faucet'}
      />
      <Pre text={result} />
    </View>
  )
}

function GetAssets() {
  const [result, setResult] = React.useState<unknown | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <View>
      <Text>wallet_getAssets</Text>
      <Button
        onPress={async () => {
          setError(null)
          setResult(null)
          try {
            const accounts = await porto.provider.request({
              method: 'eth_accounts',
            })
            if (!accounts[0]) return
            const result = await porto.provider.request({
              method: 'wallet_getAssets',
              params: [{ account: accounts[0] }],
            })
            setResult(result)
          } catch (error: any) {
            console.error('wallet_getAssets error:', error)
            setError(error?.message || 'Failed to get assets')
          }
        }}
        title="Get Assets"
      />
      {error && (
        <View
          style={{
            padding: 16,
            backgroundColor: '#fee',
            borderRadius: 8,
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: '#c00' }}>Error: {error}</Text>
        </View>
      )}
      {result ? <Pre text={result} /> : null}
    </View>
  )
}

function Accounts() {
  const [result, setResult] = React.useState<readonly string[] | null>(null)
  return (
    <View>
      <Text>eth_accounts</Text>
      <Button
        onPress={() =>
          porto.provider.request({ method: 'eth_accounts' }).then(setResult)
        }
        title="Get Accounts"
      />
      <Pre text={result} />
    </View>
  )
}

function Disconnect() {
  return (
    <View>
      <Text>wallet_disconnect</Text>
      <Button
        onPress={() => porto.provider.request({ method: 'wallet_disconnect' })}
        title="Disconnect"
      />
    </View>
  )
}

function GetAccountVersion() {
  const [result, setResult] = React.useState<unknown | null>(null)
  return (
    <View>
      <Text>wallet_getAccountVersion</Text>
      <Button
        onPress={() =>
          porto.provider
            .request({ method: 'wallet_getAccountVersion' })
            .then(setResult)
        }
        title="Get Account Version"
      />
      {result ? <Pre text={result} /> : null}
    </View>
  )
}

function SwitchChain() {
  const [chainId, setChainId] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    const onChainChanged = (chainId: string) => {
      setChainId(Hex.toNumber(chainId as `0x${string}`))
    }
    porto.provider.request({ method: 'eth_chainId' }).then(onChainChanged)
    porto.provider.on('chainChanged', onChainChanged)
    return () => porto.provider.removeListener('chainChanged', onChainChanged)
  }, [])

  return (
    <View>
      <Text>wallet_switchEthereumChain</Text>
      <Text>Current Chain ID: {chainId}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[...porto.config.chains]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((chain) => (
            <Button
              key={chain.id}
              disabled={chainId === undefined || chainId === chain.id}
              onPress={() => {
                porto.provider.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: Hex.fromNumber(chain.id) }],
                })
              }}
              title={chain.name}
            />
          ))}
      </View>
    </View>
  )
}

function GrantPermissions() {
  const [result, setResult] = React.useState<unknown | null>(null)
  return (
    <View>
      <Text>wallet_grantPermissions</Text>
      <Text style={{ fontSize: 12, color: '#f00', marginVertical: 4 }}>
        ⚠️ WARNING: Porto v0.2.28-0.2.30 in relay mode creates p256 session keys
        that the relay cannot sign with. Use the admin WebAuthn key for
        operations instead, or upgrade to a newer version of porto.
      </Text>
      <Button
        onPress={async () => {
          const p = permissions()
          if (!p) {
            console.warn('no permissions to grant')
            return
          }
          const result = await porto.provider.request({
            method: 'wallet_grantPermissions',
            params: [p],
          })
          setResult(result)
        }}
        title="Grant Permissions (Not Working in Relay Mode)"
      />
      <Pre text={result} />
    </View>
  )
}

function GetPermissions() {
  const [result, setResult] = React.useState<unknown | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <View>
      <Text>wallet_getPermissions</Text>
      <Button
        onPress={async () => {
          try {
            setError(null)
            setResult(null)

            // Check if connected first
            const accounts = await porto.provider.request({
              method: 'eth_accounts',
            })

            if (!accounts || accounts.length === 0) {
              setError('Please connect your account first')
              return
            }

            const result = await porto.provider.request({
              method: 'wallet_getPermissions',
            })
            setResult(result)
          } catch (err: any) {
            console.error('wallet_getPermissions error:', err)
            setError(err?.message || String(err))
          }
        }}
        title="Get Permissions"
      />
      <Pre text={result} />
      {error && (
        <View style={{ padding: 16, backgroundColor: '#fee', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, color: '#c00' }}>Error: {error}</Text>
        </View>
      )}
    </View>
  )
}

function RevokePermissions() {
  const [revoked, setRevoked] = React.useState(false)
  const [permissions, setPermissions] = React.useState<
    Array<{ id: string; [key: string]: unknown }>
  >([])
  const [isLoading, setIsLoading] = React.useState(false)

  const loadPermissions = async () => {
    setIsLoading(true)
    try {
      const result = await porto.provider.request({
        method: 'wallet_getPermissions',
      })
      if (Array.isArray(result)) {
        setPermissions(result as any)
      } else {
        setPermissions([])
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View>
      <Text>wallet_revokePermissions</Text>
      <Button
        disabled={isLoading}
        onPress={loadPermissions}
        title={isLoading ? 'Loading...' : 'Load Permissions'}
      />
      <Text style={{ fontSize: 12, color: '#666', marginVertical: 8 }}>
        Tap a permission to revoke it:
      </Text>
      {!permissions || permissions.length === 0 ? (
        <Text style={{ fontSize: 12, color: '#999' }}>
          No permissions loaded. Click "Load Permissions" first!
        </Text>
      ) : (
        permissions.map((permission, index) => (
          <View
            key={permission.id}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 4,
              padding: 8,
              marginVertical: 4,
            }}
          >
            <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
              ID: {permission.id}
            </Text>
            <Button
              onPress={async () => {
                setRevoked(false)
                await porto.provider.request({
                  method: 'wallet_revokePermissions',
                  params: [{ id: permission.id as `0x${string}` }],
                })
                setRevoked(true)
                // Remove from list immediately
                setPermissions((prev) =>
                  prev.filter((p) => p.id !== permission.id),
                )
              }}
              title={`Revoke Permission ${index + 1}`}
            />
          </View>
        ))
      )}
      {revoked && (
        <Text style={{ color: 'green', marginTop: 8 }}>
          Permission revoked!
        </Text>
      )}
    </View>
  )
}

function MintEXP2() {
  const [result, setResult] = React.useState<unknown | null>(null)
  const [isMinting, setIsMinting] = React.useState(false)

  return (
    <View>
      <Text>Mint EXP2 Tokens (Required for Admin Operations)</Text>
      <Text style={{ fontSize: 12, color: '#666', marginVertical: 4 }}>
        Note: Uses requiredFunds capability - Porto will automatically source
        ETH from other chains if needed.
      </Text>
      <Button
        disabled={isMinting}
        onPress={async () => {
          setIsMinting(true)
          try {
            const accounts = await porto.provider.request({
              method: 'eth_accounts',
            })
            if (!accounts[0]) return
            const chainId = Hex.toNumber(
              await porto.provider.request({
                method: 'eth_chainId',
              }),
            )
            const exp2Token = exp2Address[chainId as keyof typeof exp2Address]
            if (!exp2Token) {
              setResult({ error: 'EXP2 token not found for this chain' })
              return
            }

            const callResult = await porto.provider.request({
              method: 'wallet_sendCalls',
              params: [
                {
                  calls: [
                    {
                      data: AbiFunction.encodeData(
                        AbiFunction.fromAbi(exp1Abi, 'mint'),
                        [accounts[0], Value.fromEther('10')],
                      ),
                      to: exp2Token,
                    },
                  ],
                  capabilities: {
                    // Porto will automatically source ETH from supported chains
                    requiredFunds: [
                      {
                        symbol: 'ETH',
                        value: '0.001', // Request 0.001 ETH for gas
                      },
                    ],
                  },
                  from: accounts[0],
                  version: '1',
                },
              ],
            })
            setResult({
              success: true,
              callId: callResult.id,
              message: 'Minted 10 EXP2 tokens. Wait a moment for confirmation.',
            })
          } catch (error: any) {
            console.error('Mint EXP2 error:', error)
            if (
              error?.message?.includes('p256') ||
              error?.message?.includes('not supported')
            ) {
              setResult({
                error: error?.message,
                hint: 'Revoke any p256 session permissions using "Revoke Permissions" and try again.',
              })
            } else {
              setResult({ error: error?.message })
            }
          } finally {
            setIsMinting(false)
          }
        }}
        title={isMinting ? 'Minting...' : 'Mint 10 EXP2 Tokens'}
      />
      <Pre text={result} />
    </View>
  )
}

function GrantAdmin() {
  const [result, setResult] = React.useState<unknown | null>(null)
  return (
    <View>
      <Text>wallet_grantAdmin</Text>
      <Text style={{ fontSize: 12, color: '#999', marginVertical: 4 }}>
        Note: Requires EXP2 tokens for transaction fees. Mint tokens first if
        you get an asset deficit error.
      </Text>
      <Button
        onPress={async () => {
          const accounts = await porto.provider.request({
            method: 'eth_accounts',
          })
          if (!accounts[0]) return
          const result = await porto.provider.request({
            method: 'wallet_grantAdmin',
            params: [
              {
                key: {
                  publicKey: accounts[0],
                  type: 'secp256k1',
                },
              },
            ],
          })
          setResult(result)
        }}
        title="Grant Admin Key"
      />
      <Pre text={result} />
    </View>
  )
}

function GetAdmins() {
  const [result, setResult] = React.useState<unknown | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  return (
    <View>
      <Text>wallet_getAdmins</Text>
      <Button
        onPress={async () => {
          try {
            setError(null)
            setResult(null)

            // Check if connected first
            const accounts = await porto.provider.request({
              method: 'eth_accounts',
            })

            if (!accounts || accounts.length === 0) {
              setError('Please connect your account first')
              return
            }

            const result = await porto.provider.request({
              method: 'wallet_getAdmins',
            })
            setResult(result)
          } catch (err: any) {
            console.error('wallet_getAdmins error:', err)
            setError(err?.message || String(err))
          }
        }}
        title="Get Admin Keys"
      />
      <Pre text={result} />
      {error && (
        <View style={{ padding: 16, backgroundColor: '#fee', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, color: '#c00' }}>Error: {error}</Text>
        </View>
      )}
    </View>
  )
}

function RevokeAdmin() {
  const [revoked, setRevoked] = React.useState(false)
  const [admins, setAdmins] = React.useState<
    Array<{ id: string; [key: string]: unknown }>
  >([])
  const [isLoading, setIsLoading] = React.useState(false)

  const loadAdmins = async () => {
    setIsLoading(true)
    try {
      const result = await porto.provider.request({
        method: 'wallet_getAdmins',
      })
      if (Array.isArray(result)) {
        setAdmins(result as any)
      } else {
        setAdmins([])
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      setAdmins([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View>
      <Text>wallet_revokeAdmin</Text>
      <Button
        disabled={isLoading}
        onPress={loadAdmins}
        title={isLoading ? 'Loading...' : 'Load Admin Keys'}
      />
      <Text style={{ fontSize: 12, color: '#666', marginVertical: 8 }}>
        Tap an admin to revoke it:
      </Text>
      {!admins || admins.length === 0 ? (
        <Text style={{ fontSize: 12, color: '#999' }}>
          No admin keys loaded. Click "Load Admin Keys" first!
        </Text>
      ) : (
        admins.map((admin, index) => (
          <View
            key={admin.id}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 4,
              padding: 8,
              marginVertical: 4,
            }}
          >
            <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
              ID: {admin.id}
            </Text>
            <Button
              onPress={async () => {
                setRevoked(false)
                await porto.provider.request({
                  method: 'wallet_revokeAdmin',
                  params: [{ id: admin.id as `0x${string}` }],
                })
                setRevoked(true)
                // Remove from list immediately
                setAdmins((prev) => prev.filter((a) => a.id !== admin.id))
              }}
              title={`Revoke Admin ${index + 1}`}
            />
          </View>
        ))
      )}
      {revoked && (
        <Text style={{ color: 'green', marginTop: 8 }}>Admin key revoked!</Text>
      )}
    </View>
  )
}

function SendTransaction() {
  const [hash, setHash] = React.useState<string | null>(null)
  return (
    <View>
      <Text>eth_sendTransaction</Text>
      <Button
        onPress={async () => {
          const accounts = await porto.provider.request({
            method: 'eth_accounts',
          })
          if (!accounts[0]) return
          const hash = await porto.provider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: accounts[0],
                to: '0x0000000000000000000000000000000000000000',
                value: '0x0',
              },
            ],
          })
          setHash(hash)
        }}
        title="Send Transaction"
      />
      {hash && <Pre text={hash} />}
    </View>
  )
}

function SignMessage() {
  const [signature, setSignature] = React.useState<string | null>(null)

  return (
    <View>
      <Text>personal_sign</Text>
      <Button
        onPress={async () => {
          const accounts = await porto.provider.request({
            method: 'eth_accounts',
          })
          if (!accounts[0]) return
          const result = await porto.provider.request({
            method: 'personal_sign',
            params: [Hex.fromString('hello world'), accounts[0]],
          })
          setSignature(result)
        }}
        title="Sign Message"
      />
      <Pre text={signature} />
    </View>
  )
}

function SendCalls() {
  const [id, setId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<{} | null>(null)

  return (
    <View>
      <Text>wallet_sendCalls</Text>
      <Button
        onPress={async () => {
          const accounts = await porto.provider.request({
            method: 'eth_accounts',
          })
          if (!accounts[0]) return
          const chainId = Hex.toNumber(
            await porto.provider.request({
              method: 'eth_chainId',
            }),
          )
          const token = exp1Address[chainId as keyof typeof exp1Address]
          if (!token) return

          const result = await porto.provider.request({
            method: 'wallet_sendCalls',
            params: [
              {
                calls: [
                  {
                    data: AbiFunction.encodeData(
                      AbiFunction.fromAbi(exp1Abi, 'mint'),
                      [accounts[0], Value.fromEther('100')],
                    ),
                    to: token,
                  },
                ],
                from: accounts[0],
                version: '1',
              },
            ],
          })
          setId(result.id)
        }}
        title="Send Calls (Mint 100 EXP)"
      />
      {id && (
        <>
          <Pre text={id} />
          <Button
            onPress={async () => {
              const status = await porto.provider.request({
                method: 'wallet_getCallsStatus',
                params: [id as `0x${string}`],
              })
              setStatus(status)
            }}
            title="Get Status"
          />
          {status && <Pre text={status} />}
        </>
      )}
    </View>
  )
}

function SignTypedMessage() {
  const [signature, setSignature] = React.useState<string | null>(null)

  return (
    <View>
      <Text>eth_signTypedData_v4</Text>
      <Button
        onPress={async () => {
          const accounts = await porto.provider.request({
            method: 'eth_accounts',
          })
          if (!accounts[0]) return
          const chainId = await porto.provider.request({
            method: 'eth_chainId',
          })
          const message = {
            domain: {
              chainId: Number(chainId),
              name: 'Test App',
              version: '1',
            },
            message: {
              contents: 'Hello, World!',
            },
            primaryType: 'Mail',
            types: {
              Mail: [{ name: 'contents', type: 'string' }],
            },
          }
          const result = await porto.provider.request({
            method: 'eth_signTypedData_v4',
            params: [accounts[0], Json.stringify(message)],
          })
          setSignature(result)
        }}
        title="Sign Typed Message"
      />
      <Pre text={signature} />
    </View>
  )
}

function GetCapabilities() {
  const [result, setResult] = React.useState<Record<string, unknown> | null>(
    null,
  )
  const [chainId, setChainId] = React.useState<string | null>(null)

  React.useEffect(() => {
    porto.provider
      .request({ method: 'eth_chainId' })
      .then(setChainId)
      .catch(console.error)
  }, [])

  return (
    <View>
      <Text>wallet_getCapabilities</Text>
      <Text style={{ fontSize: 12, color: '#666', marginVertical: 4 }}>
        Shows supported capabilities like requiredFunds (cross-chain sourcing)
        and feeToken.
      </Text>
      <Button
        onPress={() =>
          porto.provider
            .request({ method: 'wallet_getCapabilities' })
            .then(setResult)
            .catch(console.error)
        }
        title="Get Capabilities (all chains)"
      />
      {chainId && (
        <Button
          onPress={() =>
            porto.provider
              .request({
                method: 'wallet_getCapabilities',
                params: [undefined, [chainId as `0x${string}`]],
              })
              .then((result) => {
                setResult(result)
              })
              .catch(console.error)
          }
          title="Get Capabilities (current chain)"
        />
      )}
      {result ? (
        <View>
          <Pre text={result} />
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 8 }}>
            Quick Info:
          </Text>
          {(() => {
            try {
              const caps = Object.values(result)[0] as any
              return (
                <View
                  style={{
                    padding: 8,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 4,
                    marginTop: 4,
                  }}
                >
                  {caps?.requiredFunds?.supported && (
                    <Text style={{ fontSize: 11 }}>
                      ✅ requiredFunds: {caps.requiredFunds.tokens?.length || 0}{' '}
                      tokens available for cross-chain sourcing
                    </Text>
                  )}
                  {caps?.feeToken?.supported && (
                    <Text style={{ fontSize: 11 }}>
                      ✅ feeToken: {caps.feeToken.tokens?.length || 0} tokens
                      available for gas payment
                    </Text>
                  )}
                  {caps?.permissions?.supported && (
                    <Text style={{ fontSize: 11 }}>
                      ✅ permissions: Session keys supported
                    </Text>
                  )}
                </View>
              )
            } catch (e) {
              return null
            }
          })()}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 42,
    textTransform: 'uppercase',
  },
  outerView: {
    flex: 1,
    paddingTop: 42,
  },
  safeAreaProvider: {
    gap: 12,
    padding: 16,
    flexDirection: 'column',
  },
  innerView: {
    gap: 12,
    maxWidth: 400,
    flexDirection: 'column',
  },
  button: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'monospace',
    borderColor: '#000',
    borderWidth: 1.5,
    color: '#000',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderColor: '#000',
    borderWidth: 1.5,
    color: '#000',
    padding: 8,
    outlineStyle: 'solid',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  link: {
    width: 405,
    padding: 5,
    fontSize: 16,
    marginLeft: 12,
    marginTop: 12,
    fontWeight: 'light',
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
  customButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    alignItems: 'center',
  },
  customButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  customButtonText: {
    color: 'white',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  customButtonTextDisabled: {
    color: '#666666',
  },
  accountText: {
    fontSize: 14,
    marginLeft: 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
})
