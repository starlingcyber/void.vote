import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PromiseClient } from "@connectrpc/connect";
import { GovernanceService, ViewService } from "@penumbra-zone/protobuf";
import { FeeTier_Tier } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb";
import { Vote_Vote } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/governance/v1/governance_pb";
import { VoteButtonState } from "../components/VoteButtonPresentation";
import { submitTransaction } from "./submit";
import { AddressIndex } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb";

async function planVote(
  view: PromiseClient<typeof ViewService>,
  gov: PromiseClient<typeof GovernanceService>,
  proposalId: bigint,
  vote: "YES" | "NO" | "ABSTAIN",
  accountId: number | null,
) {
  let protoVote;
  switch (vote) {
    case "YES":
      protoVote = Vote_Vote.YES;
      break;
    case "NO":
      protoVote = Vote_Vote.NO;
      break;
    case "ABSTAIN":
      protoVote = Vote_Vote.ABSTAIN;
      break;
  }

  const info = await gov.proposalInfo({ proposalId });
  const rateData = (
    await Array.fromAsync(gov.proposalRateData({ proposalId }))
  ).map((response) => response.rateData!);

  const plan = await view.transactionPlanner({
    feeMode: {
      case: "autoFee",
      value: {
        feeTier: FeeTier_Tier.LOW,
      },
    },
    source: new AddressIndex({ account: accountId ?? 0 }),
    delegatorVotes: [
      {
        proposal: proposalId,
        startBlockHeight: info.startBlockHeight,
        startPosition: info.startPosition,
        vote: { vote: protoVote },
        rateData,
      },
    ],
  });
  return plan.plan;
}

export const useVote = (
  view: PromiseClient<typeof ViewService>,
  gov: PromiseClient<typeof GovernanceService>,
  proposalId: bigint,
  vote: "YES" | "NO" | "ABSTAIN",
  selectedAccount: number | null,
  refetchBalances: () => void,
) => {
  const [buttonState, setButtonState] = useState<VoteButtonState>(
    VoteButtonState.IDLE,
  );

  const handleVoteSubmit = useCallback(async () => {
    if (selectedAccount === null) {
      return;
    }

    setButtonState(VoteButtonState.SUBMITTING);
    const toastId = toast.loading("Preparing to submit vote...");

    try {
      setButtonState(VoteButtonState.SUBMITTING);
      toast.loading("Planning vote transaction...", { id: toastId });
      const plan = await planVote(view, gov, proposalId, vote, selectedAccount);

      if (plan) {
        toast.loading("Authorizing vote transaction...", { id: toastId });
        await submitTransaction(view, plan, toastId);
        refetchBalances();
        toast.success("Thank you for voting!", { id: toastId });
        setButtonState(VoteButtonState.IDLE);
      } else {
        throw new Error("Failed to create transaction plan");
      }
    } catch (error: unknown) {
      console.error("Error in vote submission:", error);
      if (error instanceof Error) {
        let message = error.message;
        let alreadyVoted = error.message.includes(
          "was already used for voting on proposal",
        );
        if (alreadyVoted) {
          message = `you have already voted on Proposal #${proposalId} using Account #${selectedAccount}`;
        }
        toast.error(`Failed to submit vote: ${message}`, {
          id: toastId,
        });
      } else {
        toast.error("Failed to submit vote: An unknown error occurred", {
          id: toastId,
        });
      }
      setButtonState(VoteButtonState.ERROR);
    }
  }, [view, gov, proposalId, vote, selectedAccount]);

  return {
    buttonState,
    handleVoteSubmit,
  };
};
