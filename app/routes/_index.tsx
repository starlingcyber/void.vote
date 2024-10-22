import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { Proposal } from "~/types/Proposal";
import ProposalView from "~/components/ProposalView";
import { getProposals, tallyVotes } from "~/db.server";
import StakingInfoPanel from "~/components/StakingInfoPanel";

export const meta: MetaFunction = () => {
  return [
    { title: "void.vote | Penumbra Governance" },
    {
      name: "description",
      content:
        "View and vote on Penumbra governance proposals | by Starling Cybernetics",
    },
  ];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const proposals = await getProposals();

  const proposalsWithTally = await Promise.all(
    proposals.map(async (proposal) => {
      const tally = await tallyVotes(Number(proposal.proposal_id));
      return {
        ...proposal,
        tally: {
          yes: tally.yes.toString(),
          no: tally.no.toString(),
          abstain: tally.abstain.toString(),
        },
      };
    }),
  );

  return json({ proposals: proposalsWithTally });
}

export default function Index() {
  const { proposals } = useLoaderData() as { proposals: Proposal[] };

  return (
    <>
      <StakingInfoPanel />
      {proposals.length === 0 ? (
        <p className="mt-20 p-4 text-center font-semibold text-2xl text-gray-400 bg-slate-800 rounded">
          No governance proposals have yet been submitted.
        </p>
      ) : (
        <ul className="space-y-6">
          {proposals.map((proposal) => (
            <ProposalView proposal={proposal} key={proposal.proposal_id} />
          ))}
        </ul>
      )}
    </>
  );
}
