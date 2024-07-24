import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { Proposal } from "~/types/Proposal";
import ProposalView from "~/components/ProposalView";
import { getProposals } from "~/db.server";
import ConnectButton from "~/components/ConnectButton";
import StakeButton from "~/components/StakeButton";

export const meta: MetaFunction = () => {
  return [
    { title: "Penumbra Governance Proposals" },
    {
      name: "description",
      content: "View and discuss Penumbra Governance Proposals",
    },
  ];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  return json({ proposals: await getProposals() });
}

export default function Index() {
  const { proposals } = useLoaderData() as { proposals: Proposal[] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
          Penumbra Governance
        </h1>
        <h2 className="text-center text-3xl font-bold mb-10">
          <span className="text-teal-600">brought to you by</span>{" "}
          <a
            className="text-amber-400 underline"
            href="https://starlingcyber.net"
            target="_blank"
          >
            Starling Cybernetics
          </a>
        </h2>

        <div className="mb-8 flex justify-center">
          <ConnectButton />
          {/* <StakeButton validatorAddress="" /> */}
        </div>
        {/* <AppParameters /> */}

        {proposals.length === 0 ? (
          <p className="text-xl text-gray-400">No proposals found.</p>
        ) : (
          <ul className="space-y-6">
            {proposals.map((proposal) => (
              <ProposalView proposal={proposal} key={proposal.proposal_id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
