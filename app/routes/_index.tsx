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
import { assertProvider, assertProviderConnected } from "@penumbra-zone/client/assert";
import AppParametersView from "~/components/AppParametersView";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const PRAX_ORIGIN = "chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe";

export const meta: MetaFunction = () => {
  return [
    { title: "Void Vote" },
    { name: "description", content: "Penumbra Governance Proposals" },
  ];
};

type ServerLoaderData = { proposals: Proposal[] };
type ClientLoaderData = { appParameters: AppParametersResponse } | null;
type LoaderData = ServerLoaderData & Partial<ClientLoaderData>;

const getProposals = async () => {
  const { rows } = await pool.query<Proposal>(`
    SELECT proposal_id, title, description, kind, state, start_block_height, end_block_height, payload, proposal_deposit_amount, withdrawn, withdrawal_reason
    FROM governance_proposals
    ORDER BY proposal_id DESC
  `);
  return rows;
};

const getAppParameters = async () => {
  const viewClient = createPenumbraClientSync(ViewService, PRAX_ORIGIN);
  return await viewClient.appParameters({})
};

type ServerLoaderType = Awaited<ReturnType<typeof loader>>;
//type ClientLoaderType = Awaited<ReturnType<typeof clientLoader>>;
type LoaderType = ServerLoaderType //& Partial<ClientLoaderType>;

export async function loader({
  request,
  params,
  context,
  response,
}: LoaderFunctionArgs) {
  return json({ proposals: await getProposals() });
}

const queryClient = new QueryClient();

export default function Index() {
  const loaderData: unknown = useLoaderData();
  console.log("useLoaderData", loaderData);
  const { proposals, } = loaderData as {
    proposals: Proposal[];
  };
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  return (
        <QueryClientProvider client={queryClient}>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
          Penumbra Governance Proposals
        </h1>
          <AppParametersView />
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
