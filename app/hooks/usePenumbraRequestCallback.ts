import { PenumbraSymbol } from "@penumbra-zone/client";
import { useCallback, useEffect, useState } from "react";
import { getRequestApprovalFn } from "../penumbra.client/request";

export const usePenumbraRequestCallback = (providerOrigin: string) => {
  const [requestFn, setRequestFn] = useState<() => Promise<void>>();
  //const [requested, setRequested] = useState<Promise<void>>();

  useEffect(() => {
    if (!requestFn) {
      const rf = getRequestApprovalFn(providerOrigin);
      console.log('setting request fn', rf);
      setRequestFn(rf);
    }
    console.log('already have request fn', requestFn)
    //else if(!requested) { setRequested(requestFn()) }
  }, [requestFn, getRequestApprovalFn]);

  return useCallback(() => requestFn?.(), [requestFn]);
};
