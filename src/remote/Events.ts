import type { Payload } from '../core/Messenger.js'
import type * as Remote from './Porto.js'

/**
 * Event listener which is triggered when the remote context receives
 * an initialization message from the parent context.
 *
 * @param porto - Porto instance.
 * @param cb - Callback function.
 * @returns Unsubscribe function.
 */
export function onInitialized(
  porto: Pick<Remote.Porto<any>, 'messenger'>,
  cb: (payload: Extract<Payload<'__internal'>, { type: 'init' }>) => void,
) {
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
export function onRequests(
  porto: Pick<Remote.Porto<any>, '_internal' | 'messenger'>,
  cb: (payload: Remote.RemoteState['requests']) => void,
) {
  const { messenger, _internal } = porto
  return messenger.on('rpc-requests', (payload) => {
    const requests = payload as Remote.RemoteState['requests']
    _internal.remoteStore.setState({ requests })
    cb(requests)
  })
}
