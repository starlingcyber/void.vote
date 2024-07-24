import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PromiseClient } from "@connectrpc/connect";
import { StakeService, ViewService } from "@penumbra-zone/protobuf";
import { FeeTier_Tier } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb";
import { submitTransaction } from "./submit";

export enum StakeButtonState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUBMITTING = "SUBMITTING",
  ERROR = "ERROR",
}

async function planStake(
  view: PromiseClient<typeof ViewService>,
  stake: PromiseClient<typeof StakeService>,
  amount: bigint,
  validatorAddress: string,
) {
  const selfAddress = (
    await view.addressByIndex({
      addressIndex: { account: 0 },
    })
  ).address;

  // TODO: Implement proper conversion from validatorAddress to identityKey
  const identityKey = { key: Buffer.from(validatorAddress, "hex") };

  const rateData = (
    await stake.currentValidatorRate({
      identityKey,
    })
  ).data;

  const plan = await view.transactionPlanner({
    feeMode: {
      case: "autoFee",
      value: {
        feeTier: FeeTier_Tier.LOW,
      },
    },
    delegations: [
      {
        amount: { lo: amount, hi: BigInt(0) },
        rateData,
      },
    ],
  });
  return plan.plan;
}

export const useStake = (
  view: PromiseClient<typeof ViewService> | undefined,
  stake: PromiseClient<typeof StakeService> | undefined,
  validatorAddress: string,
) => {
  const [buttonState, setButtonState] = useState<StakeButtonState>(
    StakeButtonState.IDLE,
  );

  const handleStakeSubmit = useCallback(
    async (amount: bigint) => {
      if (!view || !stake) {
        toast.error("View or Stake client not available");
        return;
      }

      setButtonState(StakeButtonState.SUBMITTING);
      const toastId = toast.loading("Preparing to submit stake...");

      try {
        toast.loading("Planning stake transaction...", { id: toastId });
        console.log("Planning stake...");
        const plan = await planStake(view, stake, amount, validatorAddress);

        if (plan) {
          console.log("Plan created, submitting transaction...");
          toast.loading("Submitting stake transaction...", { id: toastId });
          await submitTransaction(view, plan, toastId);
          console.log("Transaction submitted successfully");
          toast.success("Stake submitted successfully!", { id: toastId });
          setButtonState(StakeButtonState.IDLE);
        } else {
          throw new Error("Failed to create transaction plan");
        }
      } catch (error: unknown) {
        console.error("Error in stake submission:", error);
        if (error instanceof Error) {
          toast.error(`Failed to submit stake: ${error.message}`, {
            id: toastId,
          });
        } else {
          toast.error("Failed to submit stake: An unknown error occurred", {
            id: toastId,
          });
        }
        setButtonState(StakeButtonState.ERROR);
      }
    },
    [view, stake, validatorAddress],
  );

  return {
    buttonState,
    handleStakeSubmit,
  };
};

export default useStake;
