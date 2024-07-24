import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";
import { NotesForVotingRequest } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb";

export interface AccountVotingPower {
  accountId: number;
  votingPower: number;
}

export function useAllAccountsVotingPower(proposalId: bigint) {
  const { viewClient, govQueryClient, connected } = useStore(
    (state: AllSlices) => state.prax,
  );

  return useQuery({
    queryKey: ["allAccountsVotingPower", proposalId.toString()],
    queryFn: async () => {
      const view = await viewClient();
      const gov = await govQueryClient();

      // Collect all the exchange rates for the validators at proposal start
      const rateList = await Array.fromAsync(
        gov.proposalRateData({ proposalId }),
      );
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

      const startHeight = (await gov.proposalInfo({ proposalId }))
        .startBlockHeight;

      const request = new NotesForVotingRequest({
        votableAtHeight: startHeight,
      });

      const responses = view.notesForVoting(request);
      const accountVotingPowers: AccountVotingPower[] = [];

      for await (const response of responses) {
        const accountId = response.noteRecord?.addressIndex?.account || 0;
        const exchangeRate = rates.get(response.identityKey?.ik.toString());

        let votingPower = BigInt(0);
        if (exchangeRate) {
          const amount = BigInt(response.noteRecord?.note?.value?.amount?.lo!);
          // Divide by 10^8 to get the actual amount, because the exchange rate is expressed as an
          // integer * 10^8
          votingPower = (amount * exchangeRate) / BigInt(10 ** 8);
        }

        const existingAccount = accountVotingPowers.find(
          (avp) => avp.accountId === accountId,
        );
        if (existingAccount) {
          existingAccount.votingPower += Number(votingPower) / 10 ** 6;
        } else {
          accountVotingPowers.push({
            accountId,
            votingPower: Number(votingPower) / 10 ** 6,
          });
        }
      }

      return accountVotingPowers;
    },
    enabled: connected,
  });
}
