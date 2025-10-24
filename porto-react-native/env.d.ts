interface EnvironmentVariables {
  readonly PORT: string
  readonly NODE_ENV: 'development' | 'production'
  readonly ENVIRONMENT: 'development' | 'production'

  readonly IOS_APP_ID: string

  readonly EXPO_DEBUG?: 'true' | 'false'
  readonly EXPO_PUBLIC_SERVER_DOMAIN: string
  readonly EXPO_PUBLIC_PORTO_BASE_URL: string

  // Full tunnel URL, e.g. "https://5650e3201c52.ngrok-free.app"
  readonly EXPO_TUNNEL_URL: string

  // Porto Relay Configuration
  // Note: Use EXPO_PUBLIC_ prefix for variables accessible in the app
  readonly EXPO_PUBLIC_LOCAL_RELAY?: 'true' | 'false'
  readonly EXPO_PUBLIC_LOCAL_RELAY_URL?: string
  readonly EXPO_PUBLIC_PRODUCTION_RELAY_URL?: string
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}

declare namespace Bun {
  interface Env extends EnvironmentVariables {}
}
