import { Secp256k1 } from 'ox';
import { parseEther } from 'viem';
import { setBalance } from 'viem/actions';
import * as Account from '../../src/core/internal/account.js';
export async function getAccount(client, parameters = {}) {
    const { keys } = parameters;
    const privateKey = Secp256k1.randomPrivateKey();
    const account = Account.fromPrivateKey(privateKey, { keys });
    await setBalance(client, {
        address: account.address,
        value: parseEther('10000'),
    });
    return {
        account,
        privateKey,
    };
}
