import { useState } from 'react'
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { usePorto } from '../providers/PortoProvider'
import { Button } from './Button'

function useMessageSigner() {
  const porto = usePorto()
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState<string | null>(null)

  const handleReset = () => {
    setMessage('')
    setSignature(null)
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
    handleReset,
    handleSign,
  }
}

function useMessageVerifier(message: string, signature: string | null) {
  const porto = usePorto()
  const [isValid, setIsValid] = useState<boolean | null>(null)

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

  return {
    isValid,
    handleVerify,
  }
}

export function SignMessage() {
  const {
    message,
    setMessage,
    signature,
    handleReset,
    handleSign,
  } = useMessageSigner()

  const { isValid, handleVerify } = useMessageVerifier(message, signature)

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionHeader}>personal_sign</Text>
        <Button onPress={handleReset} text="Reset" variant="secondary" />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Message to sign"
        value={message}
        onChangeText={setMessage}
      />
      <View style={styles.buttonSpacing}>
        <Button onPress={handleSign} text="Sign Message" />
      </View>
      {signature && (
        <>
          <Text style={styles.codeBlock}>{signature}</Text>
          <View style={styles.buttonSpacing}>
            <Button onPress={handleVerify} text="Verify Signature" />
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  buttonSpacing: {
    marginVertical: 12,
  },
  codeBlock: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
})
