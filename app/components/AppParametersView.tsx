import type { AppParametersResponse } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb";
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import useAppParameters from "~/hooks/useAppParameters";
import { useStore } from "~/state";

export default function AppParametersView() {
  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      {() => <AppParamsInnerComponent />}
    </ClientOnly>
  );
  // const appParametersQuery = useAppParameters();

  // if(appParametersQuery.data) {
  // return <div>{JSON.stringify(appParametersQuery.data)}</div>;
  // }
}

const AppParamsInnerComponent = () => {
  const {
    bears,
    addBear,
    isConnected,
    requestConnection,
    connectionErr,
    connectionLoading,
  } = useStore((state) => state.prax);

  return (
    <div>
      {isConnected() ? (
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

      <div>BEARS: {bears}</div>
      <button onClick={() => addBear()}>ADD BEAR</button>
    </div>
  );
};
