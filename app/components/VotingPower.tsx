import PraxOnly from "./PraxOnly";

export default function VotingPower({ proposalId }: { proposalId: number }) {
  return (
    <PraxOnly
      fallback={<span>Connect wallet to view voting power</span>}
      imports={{
        useVotingPower: () => import("~/hooks.client/useVotingPower"),
      }}
    >
      {({ useVotingPower }) => {
        const Content = () => {
          const { data, error, isLoading } = useVotingPower.default(proposalId);

          if (isLoading) {
            return <span>Loading voting power...</span>;
          }

          if (error) {
            return <span>Error loading voting power: {error.message}</span>;
          }

          if (data === undefined) {
            return <span>No voting power data available</span>;
          }

          // Format the voting power as a string with commas for readability
          const formattedVotingPower = data.toLocaleString();

          return <span>Your voting power: {formattedVotingPower} UM</span>;
        };

        return <Content />;
      }}
    </PraxOnly>
  );
}
