## Porto React Native (Expo) – Getting Started

This app uses Porto’s React Native mode (Expo). It serves iOS/Android deep link metadata locally and exposes it via ngrok during development. The app reads a single tunnel URL from the environment.

### Requirements

- Bun 1.3+
- Node 22+ (EAS uses Node 22)
- Expo CLI
- CocoaPods (macOS, for iOS)
- ngrok (free plan is OK)

### 1) Install dependencies

```bash
bun install
```

### 2) Create .env

Minimal dev env:

```bash
cp .env.example .env
```

Notes:
- EXPO_TUNNEL_URL must be a full URL with https. The host is extracted at build time for Associated Domains.
- If you set EXPO_PUBLIC_SERVER_DOMAIN, it must be host only (no protocol/path).

### 3) Run the local server (AASA/assetlinks)

```bash
PORT=8787 bun server/index.ts
```

Verify locally:

```bash
curl -s http://localhost:8787/.well-known/apple-app-site-association
curl -s http://localhost:8787/.well-known/assetlinks.json
```

### 4) Start ngrok (free plan)

```bash
ngrok http 8787
# copy the printed https URL, e.g. https://5650e3201c52.ngrok-free.app
```

Paste that URL into `EXPO_TUNNEL_URL` in your `.env`.

### 5) Rebuild iOS dev client (native entitlements)

If the tunnel host changed, reinstall/rebuild the iOS dev client so `associatedDomains` updates:

```bash
bun ios
# or
expo run:ios
```

### 6) Run the app

```bash
bun start  # -> expo start --clear --dev-client --tunnel
```

Open on a device/simulator using Expo Dev Client.

---

## How it works

- `server/index.ts` serves:
  - `/.well-known/apple-app-site-association` (iOS)
  - `/.well-known/assetlinks.json` (Android)
- `EXPO_TUNNEL_URL` is read in `app.config.ts`, which:
  - extracts the host and adds it to iOS `associatedDomains`
  - sets the router `origin/headOrigin` during development
- Free ngrok hosts rotate. Each change requires reinstalling the iOS dev client to refresh entitlements.

## Production setup

- Host the same well-known endpoints under your production domain.
- Set `EXPO_PUBLIC_SERVER_DOMAIN=app.example.com` (host only) for production builds.
- Do not set `EXPO_TUNNEL_URL` in production.
- Ensure `server/apple-app-site-association` includes the correct Apple Team ID + bundle ID.
- Ensure `server/assetlinks.json` uses your Android package (`com.yelo.noshDelivery`) and real signing certificate SHA256 fingerprints.

## Troubleshooting

- pod install JSON error (autolinking)
  - Usually caused by invalid env values causing config evaluation to crash.
  - Ensure `EXPO_TUNNEL_URL` is a valid https URL.
  - Reset native state and reinstall pods:

```bash
rm -rf ios/Pods ios/Podfile.lock
bun x expo prebuild --clean --platform ios
cd ios && pod install --repo-update
```

- AASA/assetlinks return 404 or HTML
  - Verify the public URL returns JSON with no redirects:

```bash
curl -i https://YOUR-RANDOM.ngrok-free.app/.well-known/apple-app-site-association
curl -i https://YOUR-RANDOM.ngrok-free.app/.well-known/assetlinks.json
```

- Universal links not opening
  - Reinstall iOS dev client after changing the tunnel host.
  - Ensure `EXPO_PUBLIC_SERVER_DOMAIN` (if used) is host only (no protocol/path).

- Crypto polyfills
  - Entry imports Porto RN shims early; if customizing the entrypoint, ensure polyfills load before routing.

## Useful scripts

- `bun dev` → `expo start`
- `bun start` → `expo start --clear --dev-client --tunnel`
- `bun ios` → `expo run:ios`
- `bun android` → `expo run:android`

## Porto client usage

See `src/lib/porto.ts`:

```ts
import { Porto, Mode } from 'porto'
import { baseSepolia } from 'porto/core/Chains'

export const porto = Porto.create({
  mode: Mode.reactNative(),
  chains: [baseSepolia],
})
```
```

- Added a concise guide with the single `EXPO_TUNNEL_URL` workflow, server/ngrok steps, iOS rebuild note, and troubleshooting.