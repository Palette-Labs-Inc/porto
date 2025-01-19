import { Stack } from 'expo-router'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { State } from '@/src/components/State'
import { Events } from '@/src/components/Events'
import { Connect } from '@/src/components/Connect'
import { Register } from '@/src/components/Register'
import { ImportAccount } from '@/src/components/ImportAccount'
import { Login } from '@/src/components/Login'
import { Disconnect } from '@/src/components/Disconnect'
import { Accounts } from '@/src/components/Accounts'
import { GetCapabilities } from '@/src/components/GetCapabilities'
import { GrantSession } from '@/src/components/GrantSession'
import { GetSessions } from '@/src/components/GetSessions'
import { SendCalls } from '@/src/components/SendCalls'
import { SendTransaction } from '@/src/components/SendTransaction'
import { SignMessage } from '@/src/components/SignMessage'
import { SignTypedData } from '@/src/components/SignTypedData'
import { PortoProvider } from '@/src/providers/PortoProvider'
export default function PlaygroundScreen() {
  return (
    <PortoProvider>
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
