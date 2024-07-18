import type { AppParametersResponse } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb";
import { useEffect, useState } from "react";
import useAppParameters from "~/hooks.client/useAppParameters";
import { useStore } from "~/state.client";

export default function AppParameters() {
  const {
    requestConnection,
    connectionErr,
    connectionLoading,
    viewClient,
    connected,
  } = useStore((state) => state.prax);
  const {
    data: appParamsData,
    error: appParamsErr,
    isLoading: appParamsLoading,
  } = useAppParameters();

  return (
    <div>
      {connected ? (
        "Connected!"
      ) : (
        <button
          onClick={() => {
            requestConnection();
          }}
        >
          CONNECT BUTTON
        </button>
      )}
      {connectionErr ? `ERROR: ${String(connectionErr)}` : null}
      {connectionLoading && "Loading connection..."}

      <div>{appParamsData && JSON.stringify(appParamsData)}</div>
      <div>{appParamsErr ? `ERROR: ${String(appParamsErr)}` : null}</div>
      <div>{appParamsLoading && "App params loading..."}</div>
    </div>
  );
}
