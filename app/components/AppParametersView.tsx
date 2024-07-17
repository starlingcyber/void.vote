import type { AppParametersResponse } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb";
import { useEffect, useState } from "react";
import useAppParameters from "~/hooks/useAppParameters";


export default function AppParametersView() {
  const appParametersQuery = useAppParameters();

  if(appParametersQuery.data) {
    return <div>{JSON.stringify(appParametersQuery.data)}</div>;
  }

  return <div>No app parameters</div>;
}
