import { createPenumbraClient } from "@penumbra-zone/client";
import { PRAX_ORIGIN } from '~/constants';

export const penumbra = createPenumbraClient(PRAX_ORIGIN);
