import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
/**
 * Hook to access and subscribe to the store of the Porto instance.
 *
 * @param porto - Porto instance.
 * @param selector - Selector function.
 * @returns Store state.
 */
export function usePortoStore(porto, selector = (state) => state) {
    const { store } = porto._internal;
    return useStore(store, useShallow(selector));
}
/**
 * Hook to access and subscribe to the remote store of the Porto instance.
 *
 * @param porto - Porto instance.
 * @param selector - Selector function.
 * @returns Remote store state.
 */
export function useRemoteStore(porto, selector = (state) => state) {
    const { remoteStore } = porto._internal;
    return useStore(remoteStore, useShallow(selector));
}
/**
 * Hook to access and subscribe to current pending requests.
 *
 * @param porto - Porto instance.
 * @returns Requests.
 */
export function useRequests(porto) {
    return useRemoteStore(porto, (state) => state.requests);
}
/**
 * Hook to access and subscribe to the next pending request.
 *
 * @param porto - Porto instance.
 * @returns Request.
 */
export function useRequest(porto) {
    return useRemoteStore(porto, (state) => state.requests[0]);
}
