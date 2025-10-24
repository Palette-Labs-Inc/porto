import { createStore } from 'zustand/vanilla'
import * as Implementation from '../core/Implementation.js'
import * as Messenger from '../core/Messenger.js'
import * as Porto_ from '../core/Porto.js'
import * as Storage from '../core/Storage.js'
export const defaultConfig = {
  ...Porto_.defaultConfig,
  implementation: Implementation.local(),
  messenger:
    typeof window !== 'undefined'
      ? Messenger.bridge({
          from: Messenger.fromWindow(window),
          to: Messenger.fromWindow(window.opener ?? window.parent),
        })
      : Messenger.noop(),
  storage: Storage.localStorage(),
}
export function create(parameters = {}) {
  const {
    chains = defaultConfig.chains,
    implementation = defaultConfig.implementation,
    messenger = defaultConfig.messenger,
    storage = defaultConfig.storage,
    transports = defaultConfig.transports,
  } = parameters
  const porto = Porto_.create({
    announceProvider: false,
    chains,
    implementation,
    storage,
    transports,
  })
  const remoteStore = createStore(() => ({
    requests: [],
  }))
  return {
    ...porto,
    messenger,
    ready: messenger.ready,
    _internal: {
      ...porto._internal,
      remoteStore,
    },
  }
}
