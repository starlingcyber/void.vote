import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PromiseClient } from "@connectrpc/connect";
import { GovernanceService, ViewService } from "@penumbra-zone/protobuf";
import {
  TransactionPlan,
  Transaction,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb";
import { FeeTier_Tier } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb";
import { Vote_Vote } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/governance/v1/governance_pb";
import { VoteButtonState } from "../components/VoteButtonPresentation";

async function submitTransaction(
  view: PromiseClient<typeof ViewService>,
  plan: TransactionPlan,
  toastId: string,
) {
  console.log("about to authorizeAndBuild");
  const responses = view.authorizeAndBuild({ transactionPlan: plan });
  let transaction: Transaction | undefined;

  for await (const response of responses) {
    switch (response.status.case) {
      case "buildProgress": {
        const progress = Math.round(response.status.value.progress * 100);
        console.log("Building transaction:", progress, "%");
        toast.loading(`Building transaction: ${progress}%`, { id: toastId });
        break;
      }
      case "complete": {
        console.log("Transaction built successfully");
        toast.success("Transaction built successfully", { id: toastId });
        transaction = response.status.value.transaction;
      }
    }
  }

  if (!transaction) {
    toast.error("Failed to build transaction", { id: toastId });
    throw new Error("Failed to build transaction");
  }

  toast.loading("Broadcasting transaction...", { id: toastId });
  const broadcastResponses = view.broadcastTransaction({
    transaction,
    awaitDetection: true,
  });

  for await (const response of broadcastResponses) {
    switch (response.status.case) {
      case "broadcastSuccess": {
        toast.loading(`Transaction broadcast: ${response.status.value.id}`, {
          id: toastId,
        });
        break;
      }
      case "confirmed": {
        toast.success(
          `Transaction confirmed at height ${response.status.value.detectionHeight}`,
          { id: toastId },
        );
        return;
      }
    }
  }

  // If we get here, the transaction wasn't confirmed
  toast.error("Transaction was not confirmed", { id: toastId });
  throw new Error("Transaction was not confirmed");
}

async function planVote(
  view: PromiseClient<typeof ViewService>,
  gov: PromiseClient<typeof GovernanceService>,
  proposalId: bigint,
  vote: "YES" | "NO" | "ABSTAIN",
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

  const selfAddress = (
    await view.addressByIndex({
      addressIndex: { account: 0 },
    })
  ).address;

  const plan = await view.transactionPlanner({
    feeMode: {
      case: "autoFee",
      value: {
        feeTier: FeeTier_Tier.LOW,
      },
    },
    // FIXME: This is a hack to work around a bug where the planner will throw an error if it can't
    // determine an "alt fee token", so we give it something to use for its heuristic
    outputs: [
      {
        value: {
          amount: { lo: BigInt(0), hi: BigInt(0) },
          assetId: { altBaseDenom: "upenumbra" },
        },
        address: selfAddress,
      },
    ],
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
  view: PromiseClient<typeof ViewService> | undefined,
  gov: PromiseClient<typeof GovernanceService> | undefined,
  proposalId: number,
  vote: "YES" | "NO" | "ABSTAIN",
) => {
  const [buttonState, setButtonState] = useState<VoteButtonState>(
    VoteButtonState.IDLE,
  );

  const handleVoteSubmit = useCallback(async () => {
    if (!view || !gov) {
      toast.error("View or Governance client not available");
      return;
    }

    setButtonState(VoteButtonState.SUBMITTING);
    const toastId = toast.loading("Preparing to submit vote...");

    try {
      setButtonState(VoteButtonState.SUBMITTING);
      toast.loading("Planning vote transaction...", { id: toastId });
      console.log("Planning vote...");
      const plan = await planVote(view, gov, BigInt(proposalId), vote);

      if (plan) {
        console.log("Plan created, submitting transaction...");
        toast.loading("Submitting vote transaction...", { id: toastId });
        await submitTransaction(view, plan, toastId);
        console.log("Transaction submitted successfully");
        toast.success("Vote submitted successfully!", { id: toastId });
        setButtonState(VoteButtonState.IDLE);
      } else {
        throw new Error("Failed to create transaction plan");
      }
    } catch (error: unknown) {
      console.error("Error in vote submission:", error);
      if (error instanceof Error) {
        toast.error(`Failed to submit vote: ${error.message}`, { id: toastId });
      } else {
        toast.error("Failed to submit vote: An unknown error occurred", {
          id: toastId,
        });
      }
      setButtonState(VoteButtonState.ERROR);
    }
  }, [view, gov, proposalId, vote]);

  return {
    buttonState,
    handleVoteSubmit,
  };
};
