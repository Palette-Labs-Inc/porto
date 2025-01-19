## General things to review
- [ ] Mobile doesn't really have a concept of a _session_ which doesn't match the intention of the Porto package. Need to research how to handle this in mobile to align with the intentions of the package.
- [ ] Add TSDoc to mobile package setup and other setups from [ox](https://github.com/wevm/ox/blob/main/package.json)

## 🚨 High Priority:
- [ ] Need to add Android records for WebAuthN.

## P256 Native Module Misimplementation:
- [ ] We are returning the derRepresentation of the P256 key gen, not the keychain storage key. 
- [ ] Would it just be easier to store some data of the publicKey as the keychain Key? Is this guaranteed to be unique?
- [ ] I think we are failing to convert from a base64Url.
- [ ] It does not make sense to generate the native key, send to native module and then use native response. 
- [ ] we should either just use the javascript key and pass it to the response converter or generate the key in the native module and then use the response converter.  


## General:
- [ ] Add platform specific exports, i.e. `porto-expo`.
- [ ] platform specific export like `porto-expo` which handles native module resolution.

- [ ] standardize polyfills into a standard package.
- [ ] clean up warnings in P256 module when running pod install
- [ ] Need better type assertions with responses from the native bridge, or explore JSI.

- [ ] Module resolution to native requires the following config. Might be able to establish separate build configs with different module resolution settings for web vs. native.
```json
// Language and environment
"moduleResolution": "node",
"module": "ES2020",
```


