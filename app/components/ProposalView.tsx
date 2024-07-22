import type { Proposal } from "~/types/Proposal";
import VotingPower from "~/components/VotingPower";

const renderValue = (value: any) => {
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return value ?? "N/A";
};

export default function ProposalView({
  proposal,
  setSelectedProposal,
  selected,
}: {
  proposal: Proposal;
  selected: boolean;
  setSelectedProposal: (id: Proposal["proposal_id"]) => void;
}) {
  return (
    <li
      key={proposal.proposal_id}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onClick={() => setSelectedProposal(proposal.proposal_id)}
    >
      <div className="p-6 cursor-pointer">
        <h2 className="text-2xl">
          <span className="font-bold mb-2 text-orange-400">
            Proposal #{proposal.proposal_id}:
          </span>{" "}
          <span className="font-semibold mb-2 text-teal-400">
            {proposal.title}
          </span>
        </h2>
        <p className="text-lightgrey-400 mb-4">
          {proposal.description || "No description provided"}
        </p>
        <div className="flex justify-between text-sm">
          {/* <span className="text-orange-400">ID: {proposal.proposal_id}</span> */}
          <span className="text-teal-400">
            Kind: {renderValue(proposal.kind)}
          </span>
        </div>
      </div>
      {selected && (
        <div className="bg-gray-700 p-6 transition-all duration-300 ease-in-out">
          <div className="mb-2">
            <span className="font-semibold text-orange-400">State:</span>{" "}
            {renderValue(proposal.state)}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-orange-400">Start Block:</span>{" "}
            {renderValue(proposal.start_block_height)}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-orange-400">End Block:</span>{" "}
            {renderValue(proposal.end_block_height)}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-orange-400">Payload:</span>{" "}
            {renderValue(proposal.payload)}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-orange-400">
              Deposit Amount:
            </span>{" "}
            {renderValue(proposal.proposal_deposit_amount)}
          </div>
          {proposal.withdrawn && (
            <div className="mt-2 p-2 bg-red-900 rounded">
              <span className="font-semibold text-red-400">Withdrawn:</span>{" "}
              {proposal.withdrawal_reason}
            </div>
          )}
          <div className="mt-4">
            <span className="font-semibold text-orange-400">
              Your Voting Power:
            </span>{" "}
            <VotingPower proposalId={proposal.proposal_id} />
          </div>
        </div>
      )}
    </li>
  );
}
