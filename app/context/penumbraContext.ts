import { PromiseClient } from '@connectrpc/connect';
import { CustodyService, ViewService } from '@penumbra-zone/protobuf';
import { createContext } from 'react';

type PenumbraClientContext = {
    viewClient: PromiseClient<typeof ViewService>;
    custodyClient: PromiseClient<typeof CustodyService>;
}

export const penumbraClientContext = createContext<Partial<PenumbraClientContext>>({})