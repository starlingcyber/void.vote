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

import type { Proposal } from "~/types/Proposal";
import ProposalView from "~/components/ProposalView";

import ConnectButton from "~/components/ConnectButton";
import AppParameters from "~/components/AppParameters";

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

  return (
    // TODO: Move Providers to root level so you don't have to wrap every route with this
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
          Penumbra Governance Proposals
        </h1>

        <ConnectButton />

        <AppParameters />

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
  );
}
