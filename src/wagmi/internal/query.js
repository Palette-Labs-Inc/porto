import { filterQueryOptions } from './utils.js';
export function keysQueryKey(options = {}) {
    const { connector, ...parameters } = options;
    return [
        'keys',
        { ...filterQueryOptions(parameters), connectorUid: connector?.uid },
    ];
}
