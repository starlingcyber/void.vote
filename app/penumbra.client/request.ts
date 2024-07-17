import { PenumbraSymbol } from '@penumbra-zone/client';

// TODO: Is this here because it needs to be in a client folder?
export const getRequestApprovalFn  = (providerOrigin: string) => {
    console.log('RUNNING REQUEST')
    const provider = window[PenumbraSymbol]?.[providerOrigin];
    return provider?.request
}