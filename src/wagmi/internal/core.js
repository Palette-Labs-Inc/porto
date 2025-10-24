import { ConnectorAlreadyConnectedError, ProviderNotFoundError, } from '@wagmi/core';
import { getConnectorClient, disconnect as wagmi_disconnect, } from '@wagmi/core/actions';
import { ChainMismatchError, } from 'viem';
export async function authorizeKey(config, parameters) {
    const { address, chainId, connector, ...key } = parameters;
    const client = await getConnectorClient(config, {
        account: address,
        chainId,
        connector,
    });
    const method = 'experimental_authorizeKey';
    return client.request({
        method,
        params: [{ address, ...key }],
    });
}
export async function connect(config, parameters) {
    // "Register" connector if not already created
    let connector;
    if (typeof parameters.connector === 'function') {
        connector = config._internal.connectors.setup(parameters.connector);
    }
    else
        connector = parameters.connector;
    // Check if connector is already connected
    if (connector.uid === config.state.current)
        throw new ConnectorAlreadyConnectedError();
    if (parameters.chainId && parameters.chainId !== config.state.chainId)
        throw new ChainMismatchError({
            chain: config.chains.find((chain) => chain.id === parameters.chainId) ??
                {
                    id: parameters.chainId,
                    name: `Chain ${parameters.chainId}`,
                },
            currentChainId: config.state.chainId,
        });
    try {
        config.setState((x) => ({ ...x, status: 'connecting' }));
        connector.emitter.emit('message', { type: 'connecting' });
        const provider = (await connector.getProvider());
        if (!provider)
            throw new ProviderNotFoundError();
        const { authorizeKey, createAccount } = parameters;
        const method = 'wallet_connect';
        await provider.request({
            method,
            params: [{ capabilities: { authorizeKey, createAccount } }],
        });
        // we already connected, but call `connector.connect` so connector even listeners are set up
        const data = await connector.connect({
            chainId: parameters.chainId,
            isReconnecting: true,
        });
        const accounts = data.accounts;
        connector.emitter.off('connect', config._internal.events.connect);
        connector.emitter.on('change', config._internal.events.change);
        connector.emitter.on('disconnect', config._internal.events.disconnect);
        await config.storage?.setItem('recentConnectorId', connector.id);
        config.setState((x) => ({
            ...x,
            connections: new Map(x.connections).set(connector.uid, {
                accounts,
                chainId: data.chainId,
                connector,
            }),
            current: connector.uid,
            status: 'connected',
        }));
        return { accounts, chainId: data.chainId };
    }
    catch (error) {
        config.setState((x) => ({
            ...x,
            // Keep existing connector connected in case of error
            status: x.current ? 'connected' : 'disconnected',
        }));
        throw error;
    }
}
export async function createAccount(config, parameters) {
    // "Register" connector if not already created
    let connector;
    if (typeof parameters.connector === 'function') {
        connector = config._internal.connectors.setup(parameters.connector);
    }
    else
        connector = parameters.connector;
    // Check if connector is already connected
    if (connector.uid === config.state.current)
        throw new ConnectorAlreadyConnectedError();
    if (parameters.chainId && parameters.chainId !== config.state.chainId)
        throw new ChainMismatchError({
            chain: config.chains.find((chain) => chain.id === parameters.chainId) ??
                {
                    id: parameters.chainId,
                    name: `Chain ${parameters.chainId}`,
                },
            currentChainId: config.state.chainId,
        });
    try {
        config.setState((x) => ({ ...x, status: 'connecting' }));
        connector.emitter.emit('message', { type: 'connecting' });
        const provider = (await connector.getProvider());
        if (!provider)
            throw new ProviderNotFoundError();
        const { label } = parameters;
        const method = 'experimental_createAccount';
        await provider.request({
            method,
            params: [{ label }],
        });
        // we already connected, but call `connector.connect` so connector even listeners are set up
        const data = await connector.connect({
            chainId: parameters.chainId,
            isReconnecting: true,
        });
        const accounts = data.accounts;
        connector.emitter.off('connect', config._internal.events.connect);
        connector.emitter.on('change', config._internal.events.change);
        connector.emitter.on('disconnect', config._internal.events.disconnect);
        await config.storage?.setItem('recentConnectorId', connector.id);
        config.setState((x) => ({
            ...x,
            connections: new Map(x.connections).set(connector.uid, {
                accounts,
                chainId: data.chainId,
                connector,
            }),
            current: connector.uid,
            status: 'connected',
        }));
        return { accounts, chainId: data.chainId };
    }
    catch (error) {
        config.setState((x) => ({
            ...x,
            // Keep existing connector connected in case of error
            status: x.current ? 'connected' : 'disconnected',
        }));
        throw error;
    }
}
export async function disconnect(config, parameters) {
    const connector = (() => {
        if (parameters.connector)
            return parameters.connector;
        const { connections, current } = config.state;
        const connection = connections.get(current);
        return connection?.connector;
    })();
    const provider = (await connector?.getProvider());
    await wagmi_disconnect(config, parameters);
    const method = 'wallet_disconnect';
    await provider?.request({ method });
}
export async function keys(config, parameters) {
    const { address, chainId, connector } = parameters;
    const client = await getConnectorClient(config, {
        account: address,
        chainId,
        connector,
    });
    const method = 'experimental_keys';
    return client.request({
        method,
        params: [{ address }],
    });
}
export async function revokeKey(config, parameters) {
    const { address, chainId, connector, publicKey } = parameters;
    const client = await getConnectorClient(config, {
        account: address,
        chainId,
        connector,
    });
    const method = 'experimental_revokeKey';
    return client.request({
        method,
        params: [{ address, publicKey }],
    });
}
export async function upgradeAccount(config, parameters) {
    // "Register" connector if not already created
    let connector;
    if (typeof parameters.connector === 'function') {
        connector = config._internal.connectors.setup(parameters.connector);
    }
    else
        connector = parameters.connector;
    // Check if connector is already connected
    if (connector.uid === config.state.current)
        throw new ConnectorAlreadyConnectedError();
    if (parameters.chainId && parameters.chainId !== config.state.chainId)
        throw new ChainMismatchError({
            chain: config.chains.find((chain) => chain.id === parameters.chainId) ??
                {
                    id: parameters.chainId,
                    name: `Chain ${parameters.chainId}`,
                },
            currentChainId: config.state.chainId,
        });
    try {
        config.setState((x) => ({ ...x, status: 'connecting' }));
        connector.emitter.emit('message', { type: 'connecting' });
        const provider = (await connector.getProvider());
        if (!provider)
            throw new ProviderNotFoundError();
        const { account, authorizeKey, label } = parameters;
        const experimental_prepareCreateAccount = 'experimental_prepareCreateAccount';
        const { context, signPayloads } = await provider.request({
            method: experimental_prepareCreateAccount,
            params: [
                { address: account.address, capabilities: { authorizeKey }, label },
            ],
        });
        const signatures = await Promise.all(signPayloads.map((hash) => account.sign({ hash })));
        const experimental_createAccount = 'experimental_createAccount';
        await provider.request({
            method: experimental_createAccount,
            params: [{ context, signatures }],
        });
        // we already connected, but call `connector.connect` so connector even listeners are set up
        const data = await connector.connect({
            chainId: parameters.chainId,
            isReconnecting: true,
        });
        const accounts = data.accounts;
        connector.emitter.off('connect', config._internal.events.connect);
        connector.emitter.on('change', config._internal.events.change);
        connector.emitter.on('disconnect', config._internal.events.disconnect);
        await config.storage?.setItem('recentConnectorId', connector.id);
        config.setState((x) => ({
            ...x,
            connections: new Map(x.connections).set(connector.uid, {
                accounts,
                chainId: data.chainId,
                connector,
            }),
            current: connector.uid,
            status: 'connected',
        }));
        return { accounts, chainId: data.chainId };
    }
    catch (error) {
        config.setState((x) => ({
            ...x,
            // Keep existing connector connected in case of error
            status: x.current ? 'connected' : 'disconnected',
        }));
        throw error;
    }
}
