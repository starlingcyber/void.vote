import PraxOnly from "~/components/PraxOnly";
import VoteButton from "~/components/VoteButton";
import VotingPower from "./VotingPower";

export default function VoteButtons({
  proposalId,
  isVoting,
}: {
  proposalId: number;
  isVoting: boolean;
}) {
  return (
    <PraxOnly
      fallback={
        <p className="text-xl font-semibold flex center text-gray-400">
          Connect Prax Wallet to vote on this proposal.
        </p>
      }
      imports={{
        useVotingPower: () => import("~/hooks.client/useVotingPower"),
      }}
    >
      {({ useVotingPower }) => {
        const VotingContent = () => {
          const {
            data: votingPower,
            isLoading,
            error,
          } = useVotingPower.default(proposalId);

          if (isLoading) return <p>Loading voting power...</p>;
          if (error) return <p>Error loading voting power</p>;
          if (!isVoting) return <p>Voting is not active for this proposal</p>;
          if (votingPower === 0)
            return <p>You have no voting power for this proposal</p>;

          return (
            <div className="flex space-x-4 mt-1">
              <VoteButton proposalId={proposalId} vote="YES" />
              <VoteButton proposalId={proposalId} vote="NO" />
              <VoteButton proposalId={proposalId} vote="ABSTAIN" />
            </div>
          );
        };

        const VotingPowerContent = () => {
          return (
            <div className="text-xl font-semibold flex center items-center mt-4 ml-3">
              <span className="text-orange-400">Your Voting Power:</span>&nbsp;
              <VotingPower proposalId={proposalId} />
            </div>
          );
        };

        return (
          <>
            <VotingContent />
            <VotingPowerContent />
          </>
        );
      }}
    </PraxOnly>
  );
}
