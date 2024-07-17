import { PromiseClient } from "@connectrpc/connect";
import { CustodyService, ViewService } from "@penumbra-zone/protobuf";
import { useEffect, useMemo, useState } from "react";
import { penumbraClientContext } from "~/context/penumbraContext";
import {
  createCustodyClient,
  createViewClient,
} from "~/penumbra.client/client";

export default function PenumbraClientProvider({
  connectedState,
  providerOrigin,
  children,
}: {
  connectedState?: boolean;
  providerOrigin: string;
  children: React.ReactNode;
}) {
  const [viewClient, setViewClient] =
    useState<PromiseClient<typeof ViewService>>();
  const [custodyClient, setCustodyClient] =
    useState<PromiseClient<typeof CustodyService>>();

  // This is eagerly requesting permission to the extension automatically
  // useEffect(() => {
  //   console.log("useEffect");
  //   if (connectedState) {
  //     if (!viewClient) {
  //       console.log("PenumbraClientProvider createViewClient");
  //       setViewClient(createViewClient(providerOrigin));
  //     }
  //     if (!custodyClient) {
  //       console.log("PenumbraClientProvider createCustodyClient");
  //       setCustodyClient(createCustodyClient(providerOrigin));
  //     }
  //   }
  // }, []);

  const penumbraClients = useMemo(
    () => ({
      viewClient,
      custodyClient,
    }),
    [viewClient, custodyClient],
  );

  return (
    <penumbraClientContext.Provider value={penumbraClients}>
      {children}
    </penumbraClientContext.Provider>
  );
}
