import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useVotingPower(proposalId: bigint) {
  const { viewClient, govQueryClient, connected } = useStore(
    (state: AllSlices) => state.prax,
  );

  return useQuery({
    queryKey: ["votingPower", proposalId],
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
      let rates = new Map();
      for (const response of rateList) {
        const identityKey = response.rateData?.identityKey!;
        // This is expressed as an integer * 10^8, so we need to divide by 10^8 later
        const exchangeRate = BigInt(
          response.rateData?.validatorExchangeRate?.lo!,
        );
        // Have to convert identity key to string to use it as a key in the map, or else equality
        // doesn't work
        rates.set(identityKey.ik.toString(), exchangeRate);
      }

      // Calculate the total voting power for all the notes, based on the exchange rate of the
      // relevant validator at the proposal start
      let power = BigInt(0);
      for (const response of notes) {
        // Have to convert identity key to string to use it as a key in the map, or else equality
        // doesn't work
        const identityKey = response.identityKey!.ik.toString();
        const exchangeRate = rates.get(identityKey);
        if (exchangeRate) {
          const amount = BigInt(response.noteRecord?.note?.value?.amount?.lo!);
          // Divide by 10^8 to get the actual amount, because the exchange rate is expressed as an
          // integer * 10^8
          power += (amount * exchangeRate) / BigInt(10 ** 8);
        }
      }
      // Divide by 10^6 because the power is expressed in base units
      return Number(power) / 10 ** 6;
    },
    enabled: connected,
  });
}
