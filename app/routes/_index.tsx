import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { pool } from "~/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Void Vote" },
    { name: "description", content: "Penumbra Governance Proposals" },
  ];
};

type Proposal = {
  proposal_id: number;
  title: string;
  description: string | null;
  kind: any; // Change to 'any' to allow for potential object values
  state: any; // Change to 'any' to allow for potential object values
  start_block_height: number | null;
  end_block_height: number | null;
};

export const loader: LoaderFunction = async () => {
  try {
    const { rows } = await pool.query<Proposal>(`
      SELECT proposal_id, title, description, kind, state, start_block_height, end_block_height
      FROM governance_proposals
      ORDER BY proposal_id DESC
      LIMIT 10
    `);
    return json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Response("Error fetching proposals", { status: 500 });
  }
};

export default function Index() {
  const proposals = useLoaderData<Proposal[]>();

  // Helper function to render complex objects
  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value ?? "N/A";
  };

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl mb-4">Penumbra Governance Proposals</h1>
      {proposals.length === 0 ? (
        <p>No proposals found.</p>
      ) : (
        <ul className="space-y-4">
          {proposals.map((proposal) => (
            <li key={proposal.proposal_id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{proposal.title}</h2>
              <p className="text-gray-600 mt-2">{proposal.description || "No description provided"}</p>
              <div className="mt-2">
                <span className="font-semibold">ID:</span> {proposal.proposal_id}
              </div>
              <div>
                <span className="font-semibold">Kind:</span> {renderValue(proposal.kind)}
              </div>
              <div>
                <span className="font-semibold">State:</span> {renderValue(proposal.state)}
              </div>
              <div>
                <span className="font-semibold">Start Block:</span> {renderValue(proposal.start_block_height)}
              </div>
              <div>
                <span className="font-semibold">End Block:</span> {renderValue(proposal.end_block_height)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}