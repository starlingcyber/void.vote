import { PromiseClient } from "@connectrpc/connect";
import { ViewService } from "@penumbra-zone/protobuf";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createViewClient } from "~/penumbra.client/client";
import { usePenumbra } from "./usePenumbra";

export default function useAppParameters() {
  const { viewClient } = usePenumbra();

  return useQuery({
    queryKey: ["appParameters"],
    queryFn: async () => {
      console.log("queryFn");
      return viewClient?.appParameters({});
    },
    enabled: Boolean(viewClient),
  });
}

export function useBalances() {
  const { viewClient } = usePenumbra();

  return useQuery({
    queryKey: ["appParameters"],
    queryFn: async () => {
      console.log("queryFn");
      const request = viewClient?.balances({});
      if (request) return arrayFromAsync(request);
      else return [];
    },
    enabled: Boolean(viewClient),
  });
}

const arrayFromAsync = async <T>(iterable: AsyncIterable<T>) => {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
};
