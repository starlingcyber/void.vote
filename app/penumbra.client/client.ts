import { PenumbraSymbol } from "@penumbra-zone/client";
import { CustodyService, ViewService } from "@penumbra-zone/protobuf";
import { createPenumbraClientSync } from "@penumbra-zone/client/create";

export const createViewClient = (provider?: string) => createPenumbraClientSync(ViewService, provider);
export const createCustodyClient = (provider?: string) => createPenumbraClientSync(CustodyService, provider);