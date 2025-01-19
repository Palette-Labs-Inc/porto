const DEBUG = true // Set to false in production

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (DEBUG) {
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>
      console.log(`[expo-webauthn] ${message}`, ...args)
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[expo-webauthn] ${message}`, error)
  },
}
