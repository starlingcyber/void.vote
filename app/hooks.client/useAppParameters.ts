import { PromiseClient } from "@connectrpc/connect";
import { ViewService } from "@penumbra-zone/protobuf";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useStore } from "~/state.client";

export default function useAppParameters() {
  const { viewClient, connected } = useStore((state) => state.prax);

  return useQuery({
    queryKey: ["appParameters"],
    queryFn: async () => {
      return (await viewClient())?.appParameters({});
    },
    enabled: connected,
  });
}

export function useBalances() {
  const { viewClient, connected } = useStore((state) => state.prax);

  return useQuery({
    queryKey: ["appParameters"],
    queryFn: async () => {
      console.log("queryFn");
      const request = (await viewClient())?.balances({});
      if (request) return Array.fromAsync(request);
      else return [];
    },
    enabled: connected,
  });
}
