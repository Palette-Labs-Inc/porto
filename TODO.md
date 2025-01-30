## General things to review
- [ ] Mobile doesn't really have a concept of a _session_ which doesn't match the intention of the Porto package. Need to research how to handle this in mobile to align with the intentions of the package.
- [ ] Add TSDoc to mobile package setup and other setups from [ox](https://github.com/wevm/ox/blob/main/package.json)

## 🚨 High Priority:
- [ ] Need to add Android records for WebAuthN.
- [ ] Fix signing issue.

## General:
- [ ] Standardize error handling in native modules
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


