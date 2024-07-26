import PraxOnly from "~/components/PraxOnly";
import VoteButton from "~/components/VoteButton";
import VotingPower from "./VotingPower";

export default function VoteButtons({
  proposalId,
  active,
}: {
  proposalId: bigint;
  active: boolean;
}) {
  return (
    <PraxOnly
      fallback={
        <p className="text-xl text-center text-gray-400 p-1 ml-2">
          {active
            ? "Connect wallet to vote on this proposal."
            : "Voting for this proposal is closed."}
        </p>
      }
      imports={{
        useVotingPower: () => import("~/hooks.client/useVotingPower"),
        useAssets: () => import("~/hooks.client/useAssets"),
      }}
    >
      {({ useVotingPower }) => {
        const VotingContent = () => {
          const {
            data: votingPower,
            isLoading,
            error,
          } = useVotingPower.default(proposalId);

          if (isLoading) return null;
          if (error) console.log("Error loading voting power", error);

          if (votingPower === undefined || votingPower == 0) {
            return (
              <div className="w-full px-3 py-3 bg-gray-700 rounded-lg text-gray-400 text-xl">
                You {active ? "are not" : "were not"} eligible to vote on this
                proposal because you were not staking when it was created. In
                order to vote on future proposals, you must stake before they
                are created.
              </div>
            );
          } else {
            return (
              <div className="flex space-x-4 p-2">
                <VoteButton proposalId={proposalId} vote="YES" />
                <VoteButton proposalId={proposalId} vote="NO" />
                <VoteButton proposalId={proposalId} vote="ABSTAIN" />
              </div>
            );
          }
        };

        const VotingPowerContent = () => {
          return (
            <div className="text-xl text-center font-semibold py-3">
              <span className="text-orange-400">
                Your Voting Power for Proposal #{proposalId.toString()}:
              </span>
              &nbsp;
              <VotingPower proposalId={proposalId} />
            </div>
          );
        };

        return (
          <div>
            <VotingContent />
            <VotingPowerContent />
          </div>
        );
      }}
    </PraxOnly>
  );
}
