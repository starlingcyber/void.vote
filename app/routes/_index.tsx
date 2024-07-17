import type {
  MetaFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  ClientLoaderFunction,
  ClientLoaderFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { pool } from "~/db.server";
import { useState } from "react";

import { ViewService } from "@penumbra-zone/protobuf";
import { createPenumbraClientSync } from "@penumbra-zone/client/create";
import { AppParametersResponse } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js";
import { PenumbraSymbol } from "@penumbra-zone/client";

import type { PlainMessage } from "@bufbuild/protobuf";
import { toPlainMessage } from "@bufbuild/protobuf";

import type { Proposal } from "~/types/Proposal";
import ProposalView from "~/components/ProposalView";
import {
  assertProvider,
  assertProviderConnected,
} from "@penumbra-zone/client/assert";
import AppParametersView from "~/components/AppParametersView";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PenumbraClientProvider from "~/components/PenumbraClientProvider";
import { usePenumbraConnected } from "~/hooks/usePenumbraConnected";
import { usePenumbraRequestCallback } from "~/hooks/usePenumbraRequestCallback";
import { getRequestApprovalFn } from "~/penumbra.client/request";
import { useStore } from "~/state";

const PRAX_ORIGIN = "chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe";

const queryClient = new QueryClient();
export const meta: MetaFunction = () => {
  return [
    { title: "Void Vote" },
    { name: "description", content: "Penumbra Governance Proposals" },
  ];
};

const getProposals = async () => {
  // TODO: Move all database queries to one place
  const { rows } = await pool.query<Proposal>(`
    SELECT proposal_id, title, description, kind, state, start_block_height, end_block_height, payload, proposal_deposit_amount, withdrawn, withdrawal_reason
    FROM governance_proposals
    ORDER BY proposal_id DESC
  `);
  return rows;
};

export async function loader({
  request,
  params,
  context,
  response,
}: LoaderFunctionArgs) {
  return json({ proposals: await getProposals() });
}

export default function Index() {
  const { proposals } = useLoaderData() as { proposals: Proposal[] };
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  // const requestApproval = usePenumbraRequestCallback(PRAX_ORIGIN);

  return (
    // TODO: Move Providers to root level so you don't have to wrap every route with this
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
            Penumbra Governance Proposals
          </h1>

          <AppParametersView />

          {/* {!isConnected ? (
            <div>
              Connect to your thingy:{" "}
              <button
                onClick={() => {
                  getRequestApprovalFn(PRAX_ORIGIN);
                  alert("boo");
                }}
              >
                CONNECT BUTTON
              </button>
            </div>
          ) : (
            <div>nice!! ur connecty</div>
          )} */}

          {/* {isConnected && <AppParametersView />} */}

          {/* <PenumbraClientProvider connectedState providerOrigin={PRAX_ORIGIN}>
            <AppParametersView />
          </PenumbraClientProvider> */}
          {proposals.length === 0 ? (
            <p className="text-xl text-gray-400">No proposals found.</p>
          ) : (
            <ul className="space-y-6">
              {proposals.map((proposal) => {
                const key = proposal.proposal_id;
                const selected = proposal.proposal_id === selectedProposal;
                return (
                  <ProposalView
                    proposal={proposal}
                    key={key}
                    selected={selected}
                    setSelectedProposal={setSelectedProposal}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}
