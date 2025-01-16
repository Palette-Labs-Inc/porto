import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Porto</Text>
      <Text style={styles.subtitle}>Navigate to the Playground tab to test Porto functionality</Text>
      <Pressable 
        style={styles.button} 
        onPress={() => router.push('/playground')}
      >
        <Text style={styles.buttonText}>Go to Playground</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
