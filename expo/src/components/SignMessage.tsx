import { View, Text, StyleSheet, Platform, TextInput } from 'react-native'
import { useState } from 'react'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

function useSignMessage() {
  const porto = usePorto()
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleReset = () => {
    setMessage('')
    setSignature(null)
    setIsValid(null)
  }

  const handleVerify = async () => {
    if (!signature) return
    const [account] = await porto.provider.request({
      method: 'eth_accounts',
    })
    const result = await porto.provider.request({
      method: 'personal_ecRecover',
      params: [message, signature],
    })
    setIsValid(result.toLowerCase() === account.toLowerCase())
  }

  const handleSign = async () => {
    const [account] = await porto.provider.request({
      method: 'eth_accounts',
    })
    const signature = await porto.provider.request({
      method: 'personal_sign',
      params: [message, account],
    })
    setSignature(signature)
  }

  return {
    message,
    setMessage,
    signature,
    isValid,
    handleReset,
    handleVerify,
    handleSign,
  }
}

export function SignMessage() {
  const {
    message,
    setMessage,
    signature,
    isValid,
    handleReset,
    handleVerify,
    handleSign,
  } = useSignMessage()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>personal_sign</Text>
      <Button onPress={handleReset} text="Reset" />
      <TextInput
        style={styles.input}
        placeholder="Message to sign"
        value={message}
        onChangeText={setMessage}
      />
      <Button onPress={handleSign} text="Sign Message" />
      {signature && (
        <>
          <Text style={styles.codeBlock}>{signature}</Text>
          <Button onPress={handleVerify} text="Verify Signature" />
          {isValid !== null && (
            <Text style={styles.codeBlock}>
              Signature is {isValid ? 'valid' : 'invalid'}
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