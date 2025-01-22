# @porto/expo-webauthn
Native WebAuthn support with [ox's WebAuthn-P256](https://oxlib.sh/guides/webauthn)

This module implements the native WebAuthn APIs for Expo, with `ox`'s `WebAuthnP256` handling cryptographic operations.

## Installation

#### Javascript

```sh
pnpm add @porto/expo-webauthn
```

#### Native

For the native part of the installation you need to run

```sh
cd ios && pod install
```

in the root of your React Native project.

---

## Configuration

### iOS

There are iOS specific steps you need to go through in order to configure Passkey support. If you have already set up an associated domain for your application you can skip this step.

#### Set up an associated domain for your application ([More info](https://developer.apple.com/documentation/xcode/supporting-associated-domains))

- You need to associate a domain with your application. On your webserver set up this route:

  ```
  GET https://<yourdomain>/.well-known/apple-app-site-association
  ```

- This route should serve a static JSON object containing your team id and bundle identifier.
  Example (replace XXXXXXXXXX with your team identifier and the rest with your bundle id, e.g. "H123456789.com.mtrx0.passkeyExample"):

  ```json
  {
    "applinks": {},
    "webcredentials": {
      "apps": ["XXXXXXXXXX.YYY.YYYYY.YYYYYYYYYYYYYY"]
    },
    "appclips": {}
  }
  ```

- In your `app.config.ts` or `app.json`, add the associated domains under the iOS configuration:

```ts
ios: {
  bundleIdentifier: "your.bundle.identifier",
  associatedDomains: [
    "applinks:your-domain.com",
    "webcredentials:your-domain.com"
  ]
}
```

Note: When building with EAS or running `expo prebuild`, this will automatically configure the Associated Domains capability in Xcode. If you're using a bare workflow, you'll need to manually add the Associated Domains capability in Xcode.

### Android

Android requires a signed APK linked to an origin via an `assetlinks.json` file. Follow [these instructions](https://coderwall.com/p/r09hoq/android-generate-release-debug-keystores) and reference your debug keystore from your `eas.json` file:

```json
"android":  {
    "buildType": "apk",
    "credentialsSource": "local"
}
```

To generate a _shared_ `debug.keystore` to avoid this complexity for each new collaborator, you can run:

```sh
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android
```

and commit the file.

The above `eas.json` section references "local" credentials and will look for a "credentials.json" file. Create a file called `credentials.json` in the root of your react-native / expo app with a keystore path that references either your own personal android keystore, or a shared keystore from the repository.

```json
{
    "android": {
      "keystore": {
        "keystorePath": "/Users/perhats/.android/debug.keystore",
        "keystorePassword": "android",
        "keyAlias": "androiddebugkey",
        "keyPassword": "android"
      }
    }
}
```

This is "okay" to commit to git given it's only a local debug store without any value and does not pose any security risk.

You'll need to grab your certificate's sha256 fingerprint and associate it with your app's domain by hosting a new file at `/.well-known/assetlinks.json`. Verify your keystore and fetch your certificate fingerprint by running:

```sh
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android
```

For first-time setup using your default android keystore:

```sh
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Your `assetlinks.json` should look like:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.your.package.name",
      "sha256_cert_fingerprints": [
        "YOUR:CERTIFICATE:FINGERPRINT:HERE"
      ]
    }
  }
]
```

After hosting the file, verify it with:

```sh
curl https://your-domain.com/.well-known/assetlinks.json
```

Finally, establish the associated domain in your `app.config.ts`:

```ts
android: {
  intentFilters: [
    {
      action: 'VIEW',
      autoVerify: true,
      data: [
        {
          scheme: 'https',
          host: 'your-domain.com',
        },
      ],
      category: ['BROWSABLE', 'DEFAULT'],
    },
  ]
}
```


#### Expo Build & Run Recipes
- Build an APK: `eas build --platform android --local --profile development-simulator`
- For testing on real devices:
  1. Enable [developer mode](https://developer.android.com/studio/debug/dev-options)
  2. Pair your device with Android Studio for debug logs via [LogCat](https://developer.android.com/studio/debug/logcat)
- For simulator testing:
  1. Log into a Google account
  2. Configure PIN encryption
  3. Test passkey functionality at https://webauthn.io before testing your APK
- Install APK using `adb`:
  ```sh
  adb devices -l  # List devices
  adb -s <device-id> install /path/to/your/app.apk
  ```

Note: While `npx expo run:android -d` is convenient for debug mode, it won't work for testing passkey functionality as the app won't be signed.

#### Common Errors

- If you receive the following error, it's likely due to improper configuration of associated domains and app signing and you should go through the steps above to fix it.

```txt
{"error": "Native error", "message": "Error: The incoming request cannot be validated"}
```
---

## Usage

#### Creating a new Passkey

```ts
import * as WebAuthN from '@porto/expo-webauthn'
import type { CredentialCreationOptions } from '@porto/expo-webauthn'

try {
  // Retrieve a valid FIDO2 attestation request from your server
  // The challenge inside the request needs to be a base64URL encoded string
  const options: CredentialCreationOptions = {
    publicKey: {
      rp: { id: 'example.com', name: 'Example' },
      user: { 
        id: new Uint8Array([1,2,3]), 
        name: 'user', 
        displayName: 'User' 
      },
      challenge: new Uint8Array([1,2,3])
    }
  }

  // Call createCredential with the options
  // A native overlay will be displayed
  const credential = await WebAuthN.createCredential(options)

  // The credential includes the attestation response
  // Pass it to your server for verification
} catch (error) {
  // Handle specific error types:
  // - MissingOptionsError: When options are undefined
  // - InvalidOptionsError: When options format is invalid
  // - MissingFieldError: When required fields are missing
  // - ParseError: When response parsing fails
  // - PublicKeyExtractionError: When key extraction fails
}
```

#### Authenticating with existing Passkey

```ts
import * as WebAuthN from '@porto/expo-webauthn'
import type { CredentialRequestOptions } from '@porto/expo-webauthn'

try {
  // Retrieve a valid FIDO2 assertion request from your server
  // The challenge inside the request needs to be a base64URL encoded string
  const options: CredentialRequestOptions = {
    publicKey: {
      challenge: new Uint8Array([1,2,3]),
      rpId: 'example.com',
      allowCredentials: [{
        id: new Uint8Array([4,5,6]),
        type: 'public-key'
      }]
    }
  }

  // Call getCredential with the options
  // A native overlay will be displayed
  const assertion = await WebAuthN.getCredential(options)

  // The assertion includes the authentication response
  // Pass it to your server for verification
} catch (error) {
  // Handle specific error types:
  // - MissingOptionsError: When options are undefined
  // - InvalidOptionsError: When options format is invalid
  // - MissingFieldError: When required fields are missing
  // - ParseError: When response parsing fails
}
```

### Integration with WebAuthnP256

This module can be used with the `ox` library's WebAuthnP256 module for advanced cryptographic operations. The WebAuthnP256 module provides utilities for working with WebAuthn-P256 Signers, which can be used for transaction signing and arbitrary payload verification.

#### Registering a WebAuthn Credential

```ts
import * as WebAuthnP256 from 'ox'
import * as WebAuthN from '@porto/expo-webauthn'
import { Platform } from 'react-native'

// Register a new WebAuthn credential
const credential = await WebAuthnP256.createCredential({
  name: 'Example',
  createFn: Platform.OS !== 'web'
    ? (options) => WebAuthN.createCredential(options)
    : undefined
})

// The credential object contains:
type P256Credential = {
  id: string          // The credential ID
  publicKey: string   // The P256 public key
  name: string        // The friendly name
}
```

#### Signing Payloads

```ts
// Sign a challenge (payload)
const { metadata, signature } = await WebAuthnP256.sign({
  challenge: '0xdeadbeef',
  credentialId: credential.id,
  getFn: Platform.OS !== 'web'
    ? (options) => WebAuthN.getCredential(options)
    : undefined
})
```

## API Reference

| Function | Description |
|----------|-------------|
| `createCredential` | Creates a new WebAuthn credential with platform authenticator |
| `getCredential` | Retrieves and authenticates with an existing credential |
| `isSupported` | Checks if WebAuthn is supported on the device |
| `createPlatformKey` | Creates a credential using platform authenticator (iOS only) |
| `createSecurityKey` | Creates a credential using security key (iOS only) |
| `getPlatformKey` | Authenticates using platform authenticator (iOS only) |
| `getSecurityKey` | Authenticates using security key (iOS only) |

### Integration Functions

| Function | Description |
|----------|-------------|
| `WebAuthnP256.createCredential` | Creates a WebAuthn-P256 credential for Ethereum operations |
| `WebAuthnP256.sign` | Signs Ethereum transactions and payloads |
| `WebAuthnP256.verify` | Verifies WebAuthn-P256 signatures |

## License

MIT