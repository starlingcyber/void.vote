import { create, StateCreator } from 'zustand'
import { AllSlices, SliceCreator } from '.'
import { produce } from 'immer'
import { PenumbraSymbol } from "@penumbra-zone/client";
import { assertProviderManifest, assertProviderRecord } from '@penumbra-zone/client/assert';
import { CustodyService, ViewService } from '@penumbra-zone/protobuf';
import { PromiseClient } from '@connectrpc/connect';
import { createPenumbraClient, getPenumbraPort } from '@penumbra-zone/client/create';
import { createPenumbraClientSync } from "@penumbra-zone/client/create";

const PRAX_ORIGIN = "chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe";

export interface PraxSlice {
    bears: number
    addBear: () => void
    isConnected: () => boolean;
    requestConnection: () => void;
    connectionErr: unknown | undefined;
    connectionLoading: boolean;
    viewClient: PromiseClient<typeof ViewService> |  undefined;
    custodyClient: PromiseClient<typeof CustodyService> | undefined;
}


export const createPraxSlice: SliceCreator<PraxSlice> = (set) => ({
    bears: 0,
    addBear: () => set((state) => produce(state, (draft) => { draft.prax.bears += 1; })),
    isConnected: () => {
        return window[PenumbraSymbol]?.[PRAX_ORIGIN]?.isConnected() || false;
    },
    viewClient: undefined,
    custodyClient: undefined,
    connectionErr: undefined,
    connectionLoading: false,
    requestConnection: () => {
        (async () => {
            try {
                set((state) => produce(state, ({prax}) => {
                    prax.connectionLoading = true;
                    prax.connectionErr = undefined;
                }))
                console.log('VIEW');
                const viewClient = await createPenumbraClient(ViewService, PRAX_ORIGIN);
                console.log('CUSTODY');
                const custodyClient = await createPenumbraClient(CustodyService, PRAX_ORIGIN);
                set((state) => produce(state, ({prax}) => {
                     prax.connectionLoading = false;
                     prax.viewClient = viewClient;
                     prax.custodyClient = custodyClient;
                }))
            } catch(e) {
                set((state) => produce(state, ({prax}) => {
                    prax.connectionErr = e;
                    prax.connectionLoading = false;
                }))
            }
        })()
    }
})

// export const getPenumbraPort = async (requireProvider?: string) => {
//     const penumbraOrigin = requireProvider ?? availableOrigin();
//     await assertProviderManifest(penumbraOrigin);
//     const provider = assertProviderRecord(penumbraOrigin);
//     if (!provider.isConnected()) {
//       await provider.request();
//     }
//     return provider.connect();
//   };
