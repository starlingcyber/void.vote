import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PromiseClient } from "@connectrpc/connect";
import { StakeService, ViewService } from "@penumbra-zone/protobuf";
import { FeeTier_Tier } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb";
import { submitTransaction } from "./submit";
import {
  AddressIndex,
  IdentityKey,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb";

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
  account: number,
  validatorAddress: string,
) {
  const identityKey = IdentityKey.fromJson({
    ik: validatorAddress,
  });

  const rateData = (
    await stake.getValidatorInfo({
      identityKey,
    })
  ).validatorInfo!.rateData!;

  const plan = await view.transactionPlanner({
    feeMode: {
      case: "autoFee",
      value: {
        feeTier: FeeTier_Tier.LOW,
      },
    },
    source: new AddressIndex({ account }),
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
  view: PromiseClient<typeof ViewService>,
  stake: PromiseClient<typeof StakeService>,
  validatorAddress: string,
) => {
  const [buttonState, setButtonState] = useState<StakeButtonState>(
    StakeButtonState.IDLE,
  );
  const [account, setAccount] = useState<number>(0);

  const handleStakeSubmit = useCallback(
    async (amount: bigint) => {
      setButtonState(StakeButtonState.SUBMITTING);
      const toastId = toast.loading("Preparing to submit stake...");

      try {
        toast.loading("Planning stake transaction...", { id: toastId });
        const plan = await planStake(
          view,
          stake,
          amount,
          account,
          validatorAddress,
        );

        if (plan) {
          toast.loading("Authorizing stake transaction...", { id: toastId });
          await submitTransaction(view, plan, toastId);
          toast.success("Delegation submitted successfully!", { id: toastId });
          setButtonState(StakeButtonState.IDLE);
        } else {
          throw new Error("Failed to create transaction plan");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(`Failed to submit delegation: ${error.message}`, {
            id: toastId,
          });
        } else {
          toast.error(
            "Failed to submit delegation: An unknown error occurred",
            {
              id: toastId,
            },
          );
        }
        setButtonState(StakeButtonState.ERROR);
      }
    },
    [view, stake, validatorAddress, account],
  );

  return {
    buttonState,
    account,
    setAccount,
    handleStakeSubmit,
  };
};

export default useStake;
