import * as AbiFunction from 'ox/AbiFunction';
import { delegationAbi } from './generated.js';
import * as Key from './key.js';
/** Stub address for self-execution. */
export const self = '0x2323232323232323232323232323232323232323';
/**
 * Instantiates values to populate a call to authorize a key.
 *
 * @param parameters - Parameters.
 * @returns Instantiated values.
 */
export function authorize(parameters) {
    const { key } = parameters;
    return {
        data: AbiFunction.encodeData(AbiFunction.fromAbi(delegationAbi, 'authorize'), [Key.serialize(key)]),
        to: self,
    };
}
const anyHash = '0x3232323232323232323232323232323232323232323232323232323232323232';
const anyTarget = '0x3232323232323232323232323232323232323232';
const anySelector = '0x32323232';
/**
 * Instantiates values to populate a call to set the label of a delegated account.
 *
 * @param parameters - Parameters.
 * @returns Instantiated values.
 */
export function setCanExecute(parameters = {}) {
    const { enabled = true, key, selector = anySelector, to = anyTarget, } = parameters;
    const hash = key ? Key.hash(key) : anyHash;
    return {
        data: AbiFunction.encodeData(AbiFunction.fromAbi(delegationAbi, 'setCanExecute'), [hash, to, selector, enabled]),
        to: self,
    };
}
/**
 * Instantiates values to populate a call to set the label of a delegated account.
 *
 * @param parameters - Parameters.
 * @returns Instantiated values.
 */
export function setLabel(parameters) {
    const { label } = parameters;
    return {
        data: AbiFunction.encodeData(AbiFunction.fromAbi(delegationAbi, 'setLabel'), [label]),
        to: self,
    };
}
/**
 * Instantiates values to populate a call to set the spend limit of a key.
 *
 * @param parameters - Parameters.
 * @returns Instantiated values.
 */
export function setSpendLimit(parameters) {
    const { key, period, limit } = parameters;
    const token = parameters.token ?? '0x0000000000000000000000000000000000000000';
    return {
        data: AbiFunction.encodeData(AbiFunction.fromAbi(delegationAbi, 'setSpendLimit'), [Key.hash(key), token, Key.toSerializedSpendPeriod[period], limit]),
        to: self,
    };
}
/**
 * Instantiates values to populate a call to remove the spend limit of a key.
 *
 * @param parameters - Parameters.
 * @returns Instantiated values.
 */
export function removeSpendLimit(parameters) {
    const { key, token, period } = parameters;
    return {
        data: AbiFunction.encodeData(AbiFunction.fromAbi(delegationAbi, 'removeSpendLimit'), [Key.hash(key), token, Key.toSerializedSpendPeriod[period]]),
        to: self,
    };
}
