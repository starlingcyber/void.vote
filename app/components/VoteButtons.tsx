import PraxOnly from "~/components/PraxOnly";
import VoteButton from "~/components/VoteButton";
import VotingPower from "./VotingPower";

export default function VoteButtons({ proposalId }: { proposalId: number }) {
  return (
    <PraxOnly
      fallback={
        <p className="text-xl font-semibold flex center text-gray-400">
          Connect Prax Wallet to vote on this proposal.
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

          if (isLoading) return <p>Loading voting power...</p>;
          if (error) return <p>Error loading voting power</p>;

          if (votingPower === undefined || votingPower === 0) {
            return null;
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
            <div className="text-xl font-semibold flex center items-center p-3 ml-2">
              <span className="text-orange-400">Your Voting Power:</span>&nbsp;
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
