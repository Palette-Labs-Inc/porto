import { TypedData } from 'ox'
import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { createClient, custom } from 'viem'
import { verifyTypedData } from 'viem/actions'
import { porto } from '../porto'
import { Button } from './Button'

const client = createClient({
  transport: custom(porto.provider),
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

export function SignTypedData() {
  const [signature, setSignature] = useState<string | null>(null)
  const [valid, setValid] = useState<boolean | null>(null)

  const resetState = () => {
    setSignature(null)
    setValid(null)
  }

  const handleVerify = async () => {
    if (!signature) return
    try {
      const [account] = await porto.provider.request({
        method: 'eth_accounts',
      })
      const valid = await verifyTypedData(client, {
        ...typedData,
        address: account,
        signature: signature as `0x${string}`,
      })
      setValid(valid)
    } catch (error) {
      console.error('Verification failed:', error)
      setValid(false)
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>eth_signTypedData_v4</Text>
      <View style={styles.row}>
        <Button onPress={resetState} text="Reset" variant="secondary" />
      </View>
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
      {signature && (
        <>
          <Text style={styles.codeBlock}>{signature}</Text>
          <Button onPress={handleVerify} text="Verify Signature" />
          {valid !== null && (
            <Text style={valid ? styles.successText : styles.errorText}>
              {valid ? 'Valid signature' : 'Invalid signature'}
            </Text>
          )}
        </>
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
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
})
