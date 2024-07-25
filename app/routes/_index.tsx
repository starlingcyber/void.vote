import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { Proposal } from "~/types/Proposal";
import ProposalView from "~/components/ProposalView";
import { getProposals, tallyVotes } from "~/db.server";
import ConnectButton from "~/components/ConnectButton";
import StakeButton from "~/components/StakeButton";
import { VALIDATOR_ADDRESS } from "~/constants";

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
  const proposals = await getProposals();

  const proposalsWithTally = await Promise.all(
    proposals.map(async (proposal) => {
      const tally = await tallyVotes(proposal.proposal_id);
      return { ...proposal, tally };
    }),
  );

  return json({ proposals: proposalsWithTally });
}

export default function Index() {
  const { proposals } = useLoaderData() as { proposals: Proposal[] };

  return proposals.length === 0 ? (
    <p className="text-xl text-gray-400">No proposals found.</p>
  ) : (
    <ul className="space-y-6">
      {proposals.map((proposal) => (
        <ProposalView proposal={proposal} key={proposal.proposal_id} />
      ))}
    </ul>
  );
}
