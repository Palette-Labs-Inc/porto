import { http, createClient, createTransport, fallback } from 'viem'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import * as Chains from './Chains.js'
import * as Implementation from './Implementation.js'
import * as Storage from './Storage.js'
import * as Provider from './internal/provider.js'
export const defaultConfig = {
  announceProvider: true,
  chains: [Chains.odysseyTestnet],
  implementation: Implementation.dialog(),
  storage: Storage.idb(),
  transports: {
    [Chains.odysseyTestnet.id]: {
      default: http(),
      relay: http('https://relay.ithaca.xyz'),
    },
  },
}
export function create(parameters = {}) {
  const {
    announceProvider = defaultConfig.announceProvider,
    chains = defaultConfig.chains,
    implementation = defaultConfig.implementation,
    storage = defaultConfig.storage,
    transports = defaultConfig.transports,
  } = parameters
  const store = createStore(
    subscribeWithSelector(
      persist(
        (_) => ({
          accounts: [],
          chain: chains[0],
          requestQueue: [],
        }),
        {
          name: 'porto.store',
          partialize(state) {
            return {
              accounts: state.accounts.map((account) => ({
                ...account,
                sign: undefined,
                keys: account.keys?.map((key) => ({
                  ...key,
                  privateKey:
                    typeof key.privateKey === 'function'
                      ? undefined
                      : key.privateKey,
                })),
              })),
              chain: state.chain,
            }
          },
          storage,
        },
      ),
    ),
  )
  store.persist.rehydrate()
  const config = {
    announceProvider,
    chains,
    implementation,
    storage,
    transports,
  }
  const internal = {
    config,
    store,
  }
  const provider = Provider.from(internal)
  const destroy = implementation.setup({
    internal,
  })
  return {
    destroy() {
      destroy()
      provider._internal.destroy()
    },
    provider,
    _internal: internal,
  }
}
/**
 * Extracts a Viem Client from a Porto instance, and an optional chain ID.
 * By default, the Client for the current chain ID will be extracted.
 *
 * @param porto - Porto instance.
 * @param parameters - Parameters.
 * @returns Client.
 */
export function getClient(porto, parameters = {}) {
  const { chainId } = parameters
  const { config, store } = porto._internal
  const { chains } = config
  const state = store.getState()
  const chain = chains.find((chain) => chain.id === chainId || state.chain.id)
  if (!chain) throw new Error('chain not found')
  const transport = config.transports[chain.id]
  if (!transport) throw new Error('transport not found')
  function getTransport(transport, methods) {
    return (config) => {
      const t = transport(config)
      return createTransport({ ...t.config, methods }, t.value)
    }
  }
  let relay
  let default_
  if (typeof transport === 'object') {
    default_ = transport.default
    relay = transport.relay
  } else {
    default_ = transport
  }
  return createClient({
    chain,
    transport: relay
      ? fallback([
          getTransport(relay, { include: ['wallet_sendTransaction'] }),
          getTransport(default_, {
            exclude: ['eth_sendTransaction', 'wallet_sendTransaction'],
          }),
        ])
      : default_,
    pollingInterval: 1_000,
  })
}
