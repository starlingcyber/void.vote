import { AccountVotingPower } from "~/types/voting";
import PraxOnly from "./PraxOnly";

export default function VotingPower({ proposalId }: { proposalId: bigint }) {
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
          const powers = data as AccountVotingPower[];

          if (isLoading) {
            return null;
          }

          if (error) {
            console.log("Error loading voting power", error);
          }

          // Format the voting power as a string with commas for readability
          const formattedVotingPower = powers
            .map(({ votingPower }) => votingPower)
            .reduce((acc, power) => acc + power, 0)
            .toLocaleString();

          return <span>{formattedVotingPower} UM</span>;
        };

        return <Content />;
      }}
    </PraxOnly>
  );
}
