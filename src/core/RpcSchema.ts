import type * as RpcSchema from 'ox/RpcSchema'

import type * as internal from './internal/rpcSchema.js'

export type Schema = RpcSchema.From<
  | RpcSchema.Default
  | {
      Request: {
        method: 'porto_ping'
      }
      ReturnType: string
    }
  | {
      Request: {
        method: 'experimental_authorizeKey'
        params: [internal.AuthorizeKeyParameters]
      }
      ReturnType: internal.AuthorizeKeyReturnType
    }
  | {
      Request: {
        method: 'experimental_createAccount'
        params?: [internal.CreateAccountParameters] | undefined
      }
      ReturnType: internal.CreateAccountReturnType
    }
  | {
      Request: {
        method: 'experimental_prepareCreateAccount'
        params: [internal.PrepareCreateAccountParameters]
      }
      ReturnType: internal.PrepareCreateAccountReturnType
    }
  | {
      Request: {
        method: 'experimental_keys'
        params?: [internal.GetKeysParameters] | undefined
      }
      ReturnType: internal.GetKeysReturnType
    }
  | {
      Request: {
        method: 'experimental_revokeKey'
        params: [internal.RevokeKeyParameters]
      }
      ReturnType: undefined
    }
  | {
      Request: {
        method: 'wallet_connect'
        params?: [internal.ConnectParameters] | undefined
      }
      ReturnType: internal.ConnectReturnType
    }
  | {
      Request: {
        method: 'wallet_disconnect'
      }
      ReturnType: undefined
    }
>
