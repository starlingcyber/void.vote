import { PenumbraSymbol } from "@penumbra-zone/client";

export const isPenumbraConnected = (providerOrigin: string) =>
  window[PenumbraSymbol]?.[providerOrigin]?.isConnected();
