/**
 * Event listener which is triggered when the remote context receives
 * an initialization message from the parent context.
 *
 * @param porto - Porto instance.
 * @param cb - Callback function.
 * @returns Unsubscribe function.
 */
export function onInitialized(porto, cb) {
  const { messenger } = porto
  return messenger.on('__internal', (payload) => {
    if (payload.type === 'init') cb(payload)
  })
}
/**
 * Event listener which is triggered when the remote context receives
 * an RPC request from the parent context.
 *
 * @param porto - Porto instance.
 * @param cb - Callback function.
 * @returns Unsubscribe function.
 */
export function onRequests(porto, cb) {
  const { messenger, _internal } = porto
  return messenger.on('rpc-requests', (payload) => {
    const requests = payload
    _internal.remoteStore.setState({ requests })
    cb(requests)
  })
}
