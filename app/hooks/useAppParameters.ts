import { PromiseClient } from "@connectrpc/connect";
import { ViewService } from "@penumbra-zone/protobuf";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createViewClient } from "~/penumbra.client/client";

export default function useAppParameters() {
  const [viewClient, setViewClient] =
    useState<PromiseClient<typeof ViewService>>();

  useEffect(() => {
    console.log('useEffect')
    if (!viewClient) {
        console.log('useEffect createViewClient')
        setViewClient(createViewClient());
    }
  });

  return useQuery({
    queryKey: ["appParameters"],
    queryFn: async () => {
        console.log('queryFn')
        return viewClient?.appParameters({})
    },
    enabled: Boolean(viewClient),
  });
}
