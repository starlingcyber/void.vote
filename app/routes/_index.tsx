import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { pool } from "~/db.server";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Void Vote" },
    { name: "description", content: "Penumbra Governance Proposals" },
  ];
};

type Proposal = {
  proposal_id: number;
  title: string;
  description: string;
  kind: any;
  state: any;
  start_block_height: number;
  end_block_height: number;
  payload: any;
  proposal_deposit_amount: number;
  withdrawn: boolean;
  withdrawal_reason: string | null;
};

export const loader: LoaderFunction = async () => {
  try {
    const { rows } = await pool.query<Proposal>(`
      SELECT proposal_id, title, description, kind, state, start_block_height, end_block_height, payload, proposal_deposit_amount, withdrawn, withdrawal_reason
      FROM governance_proposals
      ORDER BY proposal_id DESC
    `);
    return json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Response("Error fetching proposals", { status: 500 });
  }
};

export default function Index() {
  const proposals = useLoaderData<Proposal[]>();
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value ?? "N/A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
          Penumbra Governance Proposals
        </h1>
        {proposals.length === 0 ? (
          <p className="text-xl text-gray-400">No proposals found.</p>
        ) : (
          <ul className="space-y-6">
            {proposals.map((proposal) => (
              <li
                key={proposal.proposal_id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => setSelectedProposal(selectedProposal === proposal.proposal_id ? null : proposal.proposal_id)}
              >
                <div className="p-6 cursor-pointer">
                  <h2 className="text-2xl"><span className="font-bold mb-2 text-orange-400">Proposal #{proposal.proposal_id}:</span> <span className="font-semibold mb-2 text-teal-400">{proposal.title}</span></h2>
                  <p className="text-lightgrey-400 mb-4">{proposal.description || "No description provided"}</p>
                  <div className="flex justify-between text-sm">
                    {/* <span className="text-orange-400">ID: {proposal.proposal_id}</span> */}
                    <span className="text-teal-400">Kind: {renderValue(proposal.kind)}</span>
                  </div>
                </div>
                {selectedProposal === proposal.proposal_id && (
                  <div className="bg-gray-700 p-6 transition-all duration-300 ease-in-out">
                    <div className="mb-2">
                      <span className="font-semibold text-orange-400">State:</span> {renderValue(proposal.state)}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-orange-400">Start Block:</span> {renderValue(proposal.start_block_height)}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-orange-400">End Block:</span> {renderValue(proposal.end_block_height)}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-orange-400">Payload:</span> {renderValue(proposal.payload)}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-orange-400">Deposit Amount:</span> {renderValue(proposal.proposal_deposit_amount)}
                    </div>
                    {proposal.withdrawn && (
                      <div className="mt-2 p-2 bg-red-900 rounded">
                        <span className="font-semibold text-red-400">Withdrawn:</span> {proposal.withdrawal_reason}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}