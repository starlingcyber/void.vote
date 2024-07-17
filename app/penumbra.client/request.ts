import { PenumbraSymbol } from '@penumbra-zone/client';

export const getRequestFn  = (providerOrigin: string) => {
    const provider = window[PenumbraSymbol]?.[providerOrigin];
    return provider?.request
}