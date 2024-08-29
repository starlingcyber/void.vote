import PraxOnly from "~/components/PraxOnly";
import { BalancesResponse } from "@penumbra-zone/protobuf/penumbra/view/v1/view_pb";
import {
  AddressView,
  AddressView_Decoded,
} from "@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb";
import {
  ValueView,
  ValueView_KnownAssetId,
} from "@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb";

function VotingReceiptsFallback({ proposalId }: { proposalId: bigint }) {
  return (
    <p className="p-3 text-slate-400 text-xl text-center">
      Connect your wallet to view your voting receipts.
    </p>
  );
}

export default function VotingReceipts({
  proposalId,
  active,
}: {
  proposalId: bigint;
  active: boolean;
}) {
  return (
    <PraxOnly
      fallback={<VotingReceiptsFallback proposalId={proposalId} />}
      imports={{
        useBalances: () => import("~/hooks.client/useBalances"),
      }}
    >
      {({ useBalances }) => {
        const Content = () => {
          const { data: balances, isLoading, error } = useBalances.default();

          if (isLoading) {
            return <p className="text-gray-400">Loading voting receipts...</p>;
          }

          if (error) {
            console.log("Error loading balances", error);
            return (
              <p className="text-red-400">Error loading voting receipts.</p>
            );
          }

          if (!balances) {
            return null;
          }

          const votingReceipts = extractVotingReceipts(balances, proposalId);

          return (
            <div className="bg-gray-700 rounded-lg p-4">
              {votingReceipts.size === 0 ? (
                <>
                  <p className="text-gray-300 text-xl text-bold text-center">
                    <b className="text-gray-300">
                      No voting receipt tokens in your wallet for Proposal #
                      {proposalId.toString()}.
                    </b>
                  </p>
                  <br />
                  <p className="text-gray-400 text-xl">
                    This could be because you have not voted on this proposal,
                    or because you moved or traded your receipt tokens after
                    voting.
                  </p>
                </>
              ) : (
                // <ul className="space-y-3">
                //   {Array.from(votingReceipts.entries()).map(
                //     ([accountId, amount]) => (
                //       <li key={accountId} className="text-gray-300 text-xl">
                //         <span className="font-semibold text-gray-400">
                //           Account{" "}
                //           <span className="font-bold text-gray-300">
                //             #{accountId}
                //           </span>
                //           :
                //         </span>{" "}
                //         <span className="font-slanted rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-white border border-white/20">
                //           🏆 {(Number(amount) / 10 ** 6).toLocaleString()}{" "}
                //           <span className="text-indigo-300">|</span>{" "}
                //           <span className="text-gray-300">Voted On</span>{" "}
                //           <b className="text-indigo-200">
                //             #{proposalId.toString()}
                //           </b>
                //         </span>
                //       </li>
                //     ),
                //   )}
                // </ul>
                <ul className="space-y-3">
                  {Array.from(votingReceipts.entries()).map(
                    ([accountId, amount]) => (
                      <li key={accountId} className="text-gray-300 text-xl">
                        <span className="font-semibold text-gray-400">
                          Account{" "}
                          <span className="font-bold text-gray-300">
                            #{accountId}
                          </span>
                          :
                        </span>{" "}
                        <span className="inline-flex items-center font-slanted rounded-full bg-gradient-conic from-amber-300 via-yellow-300 to-amber-400 bg-[length:200%_200%] bg-[position:_0%_0%] text-amber-950 shadow-md border border-amber-200 transition-all duration-300 relative overflow-hidden group">
                          <span className="relative z-10 px-4 py-2 flex items-center space-x-2">
                            <span>🗳️</span>
                            <span className="font-semibold">
                              {(Number(amount) / 10 ** 6).toLocaleString()}
                            </span>
                          </span>
                          <span className="relative z-10 px-4 py-2 flex items-center space-x-2 border-l border-amber-600 bg-amber-500/20">
                            <span className="text-amber-900 font-medium">
                              Voted On
                            </span>
                            <b className="text-amber-950">
                              #{proposalId.toString()}
                            </b>
                          </span>
                          <span className="absolute inset-0 rounded-full bg-gradient-radial from-amber-200/50 to-transparent opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-300"></span>
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          );
        };

        return <Content />;
      }}
    </PraxOnly>
  );
}

function extractVotingReceipts(
  balances: BalancesResponse[],
  proposalId: bigint,
): Map<number, bigint> {
  const votingReceipts = new Map<number, bigint>();
  const baseDenom = `uvoted_on_${proposalId}`;

  for (const balance of balances) {
    const accountAddress = balance.accountAddress as AddressView;
    let accountId: number | undefined;

    if (accountAddress.addressView.case === "decoded") {
      const decoded = accountAddress.addressView.value;
      accountId = decoded.index?.account;
    }

    const balanceView = balance.balanceView as ValueView;

    if (accountId === undefined || !balanceView.valueView) {
      continue; // Skip this balance if required properties are missing
    }

    if (balanceView.valueView.case === "knownAssetId") {
      const knownAssetId = balanceView.valueView.value;
      if (knownAssetId.metadata?.base === baseDenom) {
        const amount =
          BigInt(knownAssetId.amount?.lo || 0) +
          (BigInt(knownAssetId.amount?.hi || 0) << 64n);

        // If there's already an entry for this account, add to it
        const existingAmount = votingReceipts.get(accountId) || 0n;
        votingReceipts.set(accountId, existingAmount + amount);
      }
    }
  }

  return votingReceipts;
}
