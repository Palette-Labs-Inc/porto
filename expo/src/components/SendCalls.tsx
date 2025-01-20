import { ExperimentERC20 } from '@/src/contracts'
import { AbiFunction, type Hex, Value } from 'ox'
import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

type Call = {
  to: Hex.Hex
  data?: Hex.Hex
  value?: Hex.Hex
}

function useSendCalls() {
  const porto = usePorto()
  const [hash, setHash] = useState<Hex.Hex | null>(null)
  const [selectedAction, setSelectedAction] = useState<string>('mint')

  const callOptions = [
    { id: 'mint', label: 'Mint 100 EXP' },
    { id: 'approve-transfer', label: 'Approve + Transfer 50 EXP' },
    { id: 'noop', label: 'Noop Calls' },
  ] as const

  const createMintCall = (account: Hex.Hex): Call => ({
    to: ExperimentERC20.address as Hex.Hex,
    data: AbiFunction.encodeData(
      AbiFunction.fromAbi(ExperimentERC20.abi, 'mint'),
      [account, Value.fromEther('100')],
    ),
  })

  const createApproveCall = (account: Hex.Hex): Call => ({
    to: ExperimentERC20.address as Hex.Hex,
    data: AbiFunction.encodeData(
      AbiFunction.fromAbi(ExperimentERC20.abi, 'approve'),
      [account, Value.fromEther('50')],
    ),
  })

  const createTransferFromCall = (account: Hex.Hex): Call => ({
    to: ExperimentERC20.address as Hex.Hex,
    data: AbiFunction.encodeData(
      AbiFunction.fromAbi(ExperimentERC20.abi, 'transferFrom'),
      [
        account,
        '0x0000000000000000000000000000000000000000' as Hex.Hex,
        Value.fromEther('50'),
      ],
    ),
  })

  const createNoopCalls = (): Call[] => [
    {
      to: '0x0000000000000000000000000000000000000000' as Hex.Hex,
      value: '0x0' as Hex.Hex,
    },
    {
      to: '0x0000000000000000000000000000000000000000' as Hex.Hex,
      value: '0x0' as Hex.Hex,
    },
  ]

  const getCallsForAction = (account: Hex.Hex, action: string): Call[] => {
    switch (action) {
      case 'mint':
        return [createMintCall(account)]
      case 'approve-transfer':
        return [createApproveCall(account), createTransferFromCall(account)]
      case 'noop':
        return createNoopCalls()
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  const handleSendCalls = async () => {
    try {
      const [account] = await porto.provider.request({
        method: 'eth_accounts',
      })

      const calls = getCallsForAction(account as Hex.Hex, selectedAction)

      const hash = await porto.provider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            calls,
            from: account,
            version: '1',
          },
        ],
      }) as Hex.Hex

      setHash(hash)
    } catch (error) {
      console.error('[SendCalls] Failed:', error)
    }
  }

  return {
    hash,
    selectedAction,
    setSelectedAction,
    callOptions,
    handleSendCalls,
  }
}

export function SendCalls() {
  const {
    hash,
    selectedAction,
    setSelectedAction,
    callOptions,
    handleSendCalls,
  } = useSendCalls()

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
