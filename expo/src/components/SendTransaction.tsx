import { ExperimentERC20 } from '@/src/contracts'
import { AbiFunction, type Hex, Value } from 'ox'
import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'
import * as Linking from 'expo-linking'

type TransactionHistory = {
  hash: Hex.Hex
  timestamp: number
}

type TransactionRequest = {
  from: Hex.Hex
  to: Hex.Hex
  data?: Hex.Hex
  value?: Hex.Hex
}

function useSendTransaction() {
  const porto = usePorto()
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [selectedAction, setSelectedAction] = useState<string>('mint')

  const transactionOptions = [
    { id: 'mint', label: 'Mint 100 EXP' },
    { id: 'noop', label: 'Noop' },
  ] as const

  const createMintTransaction = (account: Hex.Hex): TransactionRequest => ({
    from: account,
    to: ExperimentERC20.address as Hex.Hex,
    data: AbiFunction.encodeData(
      AbiFunction.fromAbi(ExperimentERC20.abi, 'mint'),
      [account, Value.fromEther('100')],
    ),
  })

  const createNoopTransaction = (account: Hex.Hex): TransactionRequest => ({
    from: account,
    to: '0x0000000000000000000000000000000000000000' as Hex.Hex,
    value: '0x0' as Hex.Hex,
  })

  const getTransactionForAction = (
    account: Hex.Hex,
    action: string,
  ): TransactionRequest => {
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

      setTransactions(prev => [{
        hash,
        timestamp: Date.now()
      }, ...prev])
    } catch (error) {
      console.error('[SendTransaction] Failed:', error)
    }
  }

  const handleOpenExplorer = async (hash: Hex.Hex) => {
    const url = `https://odyssey-explorer.ithaca.xyz/tx/${hash}`
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    }
  }

  return {
    transactions,
    selectedAction,
    setSelectedAction,
    transactionOptions,
    handleSendTransaction,
    handleOpenExplorer,
  }
}

export function SendTransaction() {
  const {
    transactions,
    selectedAction,
    setSelectedAction,
    transactionOptions,
    handleSendTransaction,
    handleOpenExplorer,
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
      {transactions.length > 0 && (
        <View style={styles.transactionListContainer}>
          <ScrollView 
            style={styles.transactionList}
            contentContainerStyle={styles.transactionListContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            overScrollMode="always"
          >
            {transactions.map((tx) => (
              <View key={tx.hash} style={styles.transactionItem}>
                <Text style={styles.codeBlock} numberOfLines={1} ellipsizeMode="middle">{tx.hash}</Text>
                <Pressable 
                  onPress={() => handleOpenExplorer(tx.hash)}
                  style={styles.linkContainer}
                >
                  <Text style={styles.link}>View on Explorer</Text>
                  <Text style={styles.linkArrow}>→</Text>
                </Pressable>
                <Text style={styles.timestamp}>
                  {new Date(tx.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>
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
  transactionListContainer: {
    marginTop: 16,
    height: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  transactionList: {
    flex: 1,
  },
  transactionListContent: {
    padding: 8,
    flexGrow: 1,
  },
  transactionItem: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  link: {
    color: '#2196F3',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  linkArrow: {
    color: '#2196F3',
    fontSize: 16,
    marginLeft: 4,
  },
})
