import { PenumbraSymbol } from "@penumbra-zone/client";
import { ViewService } from "@penumbra-zone/protobuf";
import { createPenumbraClientSync } from "@penumbra-zone/client/create";

export const createViewClient = () => createPenumbraClientSync(ViewService);
