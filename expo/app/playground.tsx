import { Accounts } from '@/src/components/Accounts'
import { AuthorizeKey } from '@/src/components/AuthorizeKey'
import { Connect } from '@/src/components/Connect'
import { Disconnect } from '@/src/components/Disconnect'
import { Events } from '@/src/components/Events'
import { GetCapabilities } from '@/src/components/GetCapabilities'
import { GetKeys } from '@/src/components/GetKeys'
import { Login } from '@/src/components/Login'
import { Register } from '@/src/components/Register'
import { SendCalls } from '@/src/components/SendCalls'
import { SendTransaction } from '@/src/components/SendTransaction'
import { SignMessage } from '@/src/components/SignMessage'
import { SignTypedData } from '@/src/components/SignTypedData'
import { State } from '@/src/components/State'
import { UpgradeAccount } from '@/src/components/UpgradeAccount'
import { PortoProvider } from '@/src/providers/PortoProvider'
import { Stack } from 'expo-router'
import { ScrollView, StyleSheet, Text } from 'react-native'

export default function PlaygroundScreen() {
  return (
    <PortoProvider>
      <Stack.Screen options={{ title: 'Porto Playground' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Porto Playground</Text>
        <SendCalls />
        <State />
        <Events />
        <Connect />
        <Register />
        <UpgradeAccount />
        <Login />
        <Disconnect />
        <Accounts />
        <GetCapabilities />
        <AuthorizeKey />
        <GetKeys />
        <SendTransaction />
        <SignMessage />
        <SignTypedData />
      </ScrollView>
    </PortoProvider>
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
})
