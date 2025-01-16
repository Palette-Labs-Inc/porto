import { polyfillWebCrypto } from 'expo-standard-web-crypto';
polyfillWebCrypto();
// crypto is now globally defined
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  )
}
