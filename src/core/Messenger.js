import * as promise from './internal/promise.js'
/**
 * Instantiates a messenger.
 *
 * @param messenger - Messenger.
 * @returns Instantiated messenger.
 */
export function from(messenger) {
  return messenger
}
/**
 * Instantiates a messenger from a window instance.
 *
 * @param w - Window.
 * @param options - Options.
 * @returns Instantiated messenger.
 */
export function fromWindow(w, options = {}) {
  const { targetOrigin } = options
  const listeners = new Map()
  return from({
    destroy() {
      for (const listener of listeners.values()) {
        w.removeEventListener('message', listener)
      }
    },
    on(topic, listener, id) {
      function handler(event) {
        if (event.data.topic !== topic) return
        if (id && event.data.id !== id) return
        if (targetOrigin && event.origin !== targetOrigin) return
        listener(event.data.payload)
      }
      w.addEventListener('message', handler)
      listeners.set(topic, handler)
      return () => w.removeEventListener('message', handler)
    },
    async send(topic, payload, target) {
      const id = crypto.randomUUID()
      w.postMessage({ id, topic, payload }, target ?? targetOrigin ?? '*')
      return { id, topic, payload }
    },
    async sendAsync(topic, payload) {
      const { id } = await this.send(topic, payload)
      return new Promise((resolve) => this.on(topic, resolve, id))
    },
  })
}
/**
 * Bridges two messengers for cross-window (e.g. parent to iframe) communication.
 *
 * @param parameters - Parameters.
 * @returns Instantiated messenger.
 */
export function bridge(parameters) {
  const { from: from_, to, waitForReady = false } = parameters
  const ready = promise.withResolvers()
  from_.on('ready', () => ready.resolve())
  const messenger = from({
    destroy() {
      from_.destroy()
      to.destroy()
      ready.reject()
    },
    on(topic, listener, id) {
      return from_.on(topic, listener, id)
    },
    async send(topic, payload) {
      if (waitForReady) await ready.promise
      return to.send(topic, payload)
    },
    async sendAsync(topic, payload) {
      if (waitForReady) await ready.promise
      return to.sendAsync(topic, payload)
    },
  })
  return {
    ...messenger,
    ready() {
      messenger.send('ready', undefined)
    },
  }
}
export function noop() {
  return {
    destroy() {},
    on() {
      return () => {}
    },
    ready() {},
    send() {
      return Promise.resolve(undefined)
    },
    sendAsync() {
      return Promise.resolve(undefined)
    },
  }
}
