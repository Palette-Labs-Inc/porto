import { ExperimentERC20 } from '@/src/contracts'
import { AbiFunction, type Hex, Value } from 'ox'
import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

type Transaction = {
  from: Hex.Hex
  to: Hex.Hex
  data?: Hex.Hex
  value?: Hex.Hex
}

function useSendTransaction() {
  const porto = usePorto()
  const [hash, setHash] = useState<Hex.Hex | null>(null)
  const [selectedAction, setSelectedAction] = useState<string>('mint')

  const transactionOptions = [
    { id: 'mint', label: 'Mint 100 EXP' },
    { id: 'noop', label: 'Noop' },
  ] as const

  const createMintTransaction = (account: Hex.Hex): Transaction => ({
    from: account,
    to: ExperimentERC20.address as Hex.Hex,
    data: AbiFunction.encodeData(
      AbiFunction.fromAbi(ExperimentERC20.abi, 'mint'),
      [account, Value.fromEther('100')],
    ),
  })

  const createNoopTransaction = (account: Hex.Hex): Transaction => ({
    from: account,
    to: '0x0000000000000000000000000000000000000000' as Hex.Hex,
    value: '0x0' as Hex.Hex,
  })

  const getTransactionForAction = (
    account: Hex.Hex,
    action: string,
  ): Transaction => {
    switch (action) {
      case 'mint':
        return createMintTransaction(account)
      case 'noop':
        return createNoopTransaction(account)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  const handleSendTransaction = async () => {
    try {
      const [account] = await porto.provider.request({
        method: 'eth_accounts',
      })

      const transaction = getTransactionForAction(
        account as Hex.Hex,
        selectedAction,
      )

      const hash = (await porto.provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      })) as Hex.Hex

      setHash(hash)
    } catch (error) {
      console.error('[SendTransaction] Failed:', error)
    }
  }

  return {
    hash,
    selectedAction,
    setSelectedAction,
    transactionOptions,
    handleSendTransaction,
  }
}

export function SendTransaction() {
  const {
    hash,
    selectedAction,
    setSelectedAction,
    transactionOptions,
    handleSendTransaction,
  } = useSendTransaction()

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
      {hash && (
        <View>
          <Text style={styles.codeBlock}>{hash}</Text>
          <Text style={styles.link}>
            View on Explorer: https://odyssey-explorer.ithaca.xyz/tx/{hash}
          </Text>
        </View>
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
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
  link: {
    color: '#2196F3',
    marginTop: 8,
  },
})
