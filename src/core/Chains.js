import * as chains from 'viem/chains';
import { delegationAddress } from './internal/generated.js';
export function define(chain) {
    return chain;
}
export const odysseyTestnet = /*#__PURE__*/ define({
    ...chains.odysseyTestnet,
    contracts: {
        ...chains.odysseyTestnet.contracts,
        delegation: {
            address: delegationAddress[chains.odysseyTestnet.id],
        },
    },
});
