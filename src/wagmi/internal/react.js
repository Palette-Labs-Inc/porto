'use client';
import { skipToken, useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { useAccount, useChainId, useConfig, } from 'wagmi';
import { authorizeKey, connect, createAccount, disconnect, keys, revokeKey, upgradeAccount, } from './core.js';
import { keysQueryKey } from './query.js';
export function useAuthorizeKey(parameters = {}) {
    const { mutation } = parameters;
    const config = useConfig(parameters);
    return useMutation({
        ...mutation,
        async mutationFn(variables) {
            return authorizeKey(config, variables);
        },
        mutationKey: ['authorizeKey'],
    });
}
export function useConnect(parameters = {}) {
    const { mutation } = parameters;
    const config = useConfig(parameters);
    return useMutation({
        ...mutation,
        async mutationFn(variables) {
            return connect(config, variables);
        },
        mutationKey: ['connect'],
    });
}
export function useCreateAccount(parameters = {}) {
    const { mutation } = parameters;
    const config = useConfig(parameters);
    return useMutation({
        ...mutation,
        async mutationFn(variables) {
            return createAccount(config, variables);
        },
        mutationKey: ['createAccount'],
    });
}
export function useDisconnect(parameters = {}) {
    const { mutation } = parameters;
    const config = useConfig(parameters);
    return useMutation({
        ...mutation,
        async mutationFn(variables) {
            await disconnect(config, variables);
        },
        mutationKey: ['disconnect'],
    });
}
export function useKeys(parameters = {}) {
    const { query = {}, ...rest } = parameters;
    const config = useConfig(rest);
    const queryClient = useQueryClient();
    const chainId = useChainId({ config });
    const { address, connector, status } = useAccount();
    const activeConnector = parameters.connector ?? connector;
    const enabled = Boolean((status === 'connected' ||
        (status === 'reconnecting' && activeConnector?.getProvider)) &&
        (query.enabled ?? true));
    const queryKey = useMemo(() => keysQueryKey({
        address,
        chainId: parameters.chainId ?? chainId,
        connector: activeConnector,
    }), [address, chainId, parameters.chainId, activeConnector]);
    const provider = useRef();
    // biome-ignore lint/correctness/useExhaustiveDependencies: `queryKey` not required
    useEffect(() => {
        if (!activeConnector)
            return;
        (async () => {
            provider.current ??=
                (await activeConnector.getProvider?.());
            provider.current?.on('message', (event) => {
                if (event.type !== 'keysChanged')
                    return;
                queryClient.setQueryData(queryKey, event.data);
            });
        })();
    }, [address, activeConnector, queryClient]);
    return useQuery({
        ...query,
        enabled,
        gcTime: 0,
        queryKey,
        queryFn: activeConnector
            ? async (context) => {
                const { connectorUid: _, ...options } = context.queryKey[1];
                provider.current ??=
                    (await activeConnector.getProvider());
                return await keys(config, {
                    ...options,
                    connector: activeConnector,
                });
            }
            : skipToken,
        staleTime: Number.POSITIVE_INFINITY,
    });
}
export function useRevokeKey(parameters = {}) {
    const { mutation } = parameters;
    const config = useConfig(parameters);
    return useMutation({
        ...mutation,
        async mutationFn(variables) {
            return revokeKey(config, variables);
        },
        mutationKey: ['revokeKey'],
    });
}
export function useUpgradeAccount(parameters = {}) {
    const { mutation } = parameters;
    const config = useConfig(parameters);
    return useMutation({
        ...mutation,
        async mutationFn(variables) {
            return upgradeAccount(config, variables);
        },
        mutationKey: ['upgradeAccount'],
    });
}
