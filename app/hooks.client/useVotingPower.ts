import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";
import { AccountVotingPower } from "../types/voting";

export default function useVotingPower(proposalId: bigint) {
  const { viewClient, govQueryClient, connected } = useStore(
    (state: AllSlices) => state.prax,
  );

  return useQuery({
    queryKey: ["votingPower", proposalId.toString()],
    queryFn: async () => {
      const view = await viewClient();
      const gov = await govQueryClient();

      // Gather queries for proposal info, notes, and exchange rates
      const info = await gov.proposalInfo({ proposalId });
      const notes = await Array.fromAsync(
        view.notesForVoting({ votableAtHeight: info.startBlockHeight }) || [],
      );
      const rateList = await Array.fromAsync(
        gov.proposalRateData({ proposalId }),
      );

      // Collect all the exchange rates for the validators at proposal start
      const rates = new Map(
        rateList.map((response) => [
          response.rateData?.identityKey!.ik.toString(),
          BigInt(response.rateData?.validatorExchangeRate?.lo!),
        ]),
      );

      // Calculate the voting power for each account
      const accountVotingPowers = new Map<number, bigint>();

      for (const response of notes) {
        const accountId = response.noteRecord?.addressIndex?.account || 0;
        const identityKey = response.identityKey!.ik.toString();
        const exchangeRate = rates.get(identityKey);

        if (exchangeRate) {
          const amount = BigInt(response.noteRecord?.note?.value?.amount?.lo!);
          const power = (amount * exchangeRate) / BigInt(10 ** 8);

          accountVotingPowers.set(
            accountId,
            (accountVotingPowers.get(accountId) || BigInt(0)) + power,
          );
        }
      }

      // Convert to AccountVotingPower array and sort by voting power
      const result: AccountVotingPower[] = Array.from(
        accountVotingPowers.entries(),
      )
        .map(([accountId, power]) => ({
          accountId,
          votingPower: Number(power) / 10 ** 6,
        }))
        .sort((a, b) => b.votingPower - a.votingPower);

      return result;
    },
    enabled: connected,
  });
}
