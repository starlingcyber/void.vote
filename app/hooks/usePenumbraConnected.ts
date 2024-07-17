import { useEffect, useState } from "react";
import { isPenumbraConnected } from "../penumbra.client/connected";

export const usePenumbraConnected = (providerOrigin: string) => {
  const [connected, setConnected] = useState<boolean>();

  useEffect(() => setConnected(isPenumbraConnected(providerOrigin)));

  return connected;
};
