import { create, StateCreator } from "zustand";
import { AllSlices, SliceCreator } from ".";
import { produce } from "immer";
import { PenumbraSymbol } from "@penumbra-zone/client";
import {
  assertProviderManifest,
  assertProviderRecord,
} from "@penumbra-zone/client/assert";
import {
  CustodyService,
  PenumbraService,
  ViewService,
} from "@penumbra-zone/protobuf";
import { PromiseClient } from "@connectrpc/connect";
import {
  createPenumbraClient,
  getPenumbraPort,
} from "@penumbra-zone/client/create";
import { createPenumbraClientSync } from "@penumbra-zone/client/create";
import { ServiceType } from "@bufbuild/protobuf";

const PRAX_ORIGIN = "chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe";

export interface PraxSlice {
  requestConnection: () => Promise<void>;
  connected: boolean;
  connectionErr: unknown | undefined;
  connectionLoading: boolean;
  viewClient: () => Promise<PromiseClient<typeof ViewService> | undefined>;
  custodyClient: () => Promise<
    PromiseClient<typeof CustodyService> | undefined
  >;
}

export const createPraxSlice: SliceCreator<PraxSlice> = (set, get) => ({
  connected: window[PenumbraSymbol]?.[PRAX_ORIGIN].isConnected() || false,
  viewClient: createClientGetter(ViewService, set),
  custodyClient: createClientGetter(CustodyService, set),
  connectionErr: undefined,
  connectionLoading: false,
  requestConnection: async () => {
    await get().prax.viewClient();
  },
});

const createClientGetter = <T extends PenumbraService>(
  Service: T,
  set: (state: (arg: AllSlices) => AllSlices) => void,
) => {
  let client: PromiseClient<T> | undefined;
  return async () => {
    if (!client) {
      try {
        set((state) =>
          produce(state, ({ prax }) => {
            prax.connectionLoading = true;
          }),
        );
        client = await createPenumbraClient(Service, PRAX_ORIGIN);
        set((state) =>
          produce(state, ({ prax }) => {
            prax.connectionErr = undefined;
            prax.connected = true;
            prax.connectionLoading = false;
          }),
        );
      } catch (e) {
        set((state) =>
          produce(state, ({ prax }) => {
            prax.connectionErr = e;
            prax.connected = false;
          }),
        );
      }
    }
    return client;
  };
};
