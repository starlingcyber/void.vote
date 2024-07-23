import { useState, useEffect } from "react";
import {
  CustodyService,
  GovernanceService,
  ViewService,
} from "@penumbra-zone/protobuf";
import PraxOnly from "./PraxOnly";
import {
  Transaction,
  TransactionPlan,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb";
import toast from "react-hot-toast";
import { PromiseClient } from "@connectrpc/connect";
import { FeeTier_Tier } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb";
import { Vote_Vote } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/governance/v1/governance_pb";

enum VoteButtonState {
  IDLE = "IDLE",
  SUBMITTING = "SUBMITTING",
  ERROR = "ERROR",
}

const VOTE_BUTTON_BASE_CLASS = `
  px-4 py-2 rounded-md font-bold text-white transition-all duration-100 ease-in-out
  focus:outline-none focus:ring-2 focus:ring-offset-2
  w-64 h-12 flex items-center justify-center text-xl
`;

const getVoteButtonClass = (vote: string, state: VoteButtonState) => {
  let colorClass = "";
  switch (vote) {
    case "YES":
      colorClass = "bg-green-500 hover:bg-green-600 focus:ring-green-500";
      break;
    case "NO":
      colorClass = "bg-red-500 hover:bg-red-600 focus:ring-red-500";
      break;
    case "ABSTAIN":
      colorClass = "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500";
      break;
  }

  if (state === VoteButtonState.SUBMITTING) {
    colorClass = "bg-gray-400 cursor-not-allowed";
  } else if (state === VoteButtonState.ERROR) {
    colorClass = "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500";
  }

  return `${VOTE_BUTTON_BASE_CLASS} ${colorClass}`;
};

const getVoteEmoji = (vote: string) => {
  switch (vote) {
    case "YES":
      return "👍";
    case "NO":
      return "👎";
    case "ABSTAIN":
      return "🤐";
    default:
      return "";
  }
};

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
  const notes = await Array.fromAsync(
    view.notesForVoting({ votableAtHeight: info.startBlockHeight }) || [],
  );
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
    delegatorVotes: notes.map(({ noteRecord, identityKey }) => ({
      proposal: proposalId,
      vote: { vote: protoVote },
      note: noteRecord!.note,
      identityKey,
      rateData,
    })),
  });
  return plan.plan;
}

async function submitTransaction(
  view: PromiseClient<typeof ViewService>,
  plan: TransactionPlan,
) {
  const responses = view.authorizeAndBuild({ transactionPlan: plan });
  let transaction: Transaction | undefined;
  for await (const response of responses) {
    switch (response.status.case) {
      case "buildProgress": {
        console.log(`Build progress: ${response.status.value}`);
        break;
      }
      case "complete": {
        console.log(
          `Transaction complete: ${response.status.value.transaction}`,
        );
        transaction = response.status.value.transaction;
      }
    }
  }

  if (transaction) {
    const responses = view.broadcastTransaction({
      transaction,
      awaitDetection: true,
    });
    for await (const response of responses) {
      switch (response.status.case) {
        case "broadcastSuccess": {
          console.log(`Transaction broadcast: ${response.status.value.id}`);
          break;
        }
        case "confirmed": {
          console.log(
            `Transaction confirmed: ${response.status.value.id} @ ${response.status.value.detectionHeight}`,
          );
          return;
        }
      }
    }
  } else {
    throw new Error("Failed to build transaction");
  }
}

export default function VotingPower({
  vote,
  proposalId,
}: {
  proposalId: number;
  vote: "YES" | "NO" | "ABSTAIN";
}) {
  return (
    <PraxOnly
      fallback={<span>Connect wallet to vote</span>}
      imports={{
        useView: () => import("~/hooks.client/useView"),
        useGovernance: () => import("~/hooks.client/useGovernance"),
      }}
    >
      {({ useView, useGovernance }) => {
        const Content = () => {
          const [buttonState, setButtonState] = useState<VoteButtonState>(
            VoteButtonState.IDLE,
          );

          const viewQuery = useView.default();
          const govQuery = useGovernance.default();

          const view = viewQuery.data;
          const gov = govQuery.data;
          const isLoading = viewQuery.isLoading || govQuery.isLoading;
          const error = viewQuery.error || govQuery.error;

          useEffect(() => {
            if (buttonState === VoteButtonState.SUBMITTING) {
              handleVoteSubmit();
            }
          }, [buttonState]);

          const handleVoteSubmit = async () => {
            if (!view || !gov) {
              toast.error("View or Governance client not available");
              return;
            }

            setButtonState(VoteButtonState.SUBMITTING);

            const toastId = toast.loading("Submitting vote...");

            try {
              const plan = await planVote(view, gov, BigInt(proposalId), vote);
              if (plan) {
                await submitTransaction(view, plan);
                toast.success("Vote submitted successfully!", { id: toastId });
                setButtonState(VoteButtonState.IDLE);
              }
            } catch (error) {
              console.log(error);
              toast.error("Failed to submit vote. Please try again.", {
                id: toastId,
              });
              setButtonState(VoteButtonState.ERROR);
            }
          };

          const getButtonText = () => {
            switch (buttonState) {
              case VoteButtonState.SUBMITTING:
                return "Submitting...";
              case VoteButtonState.ERROR:
                return `Retry ${vote} Vote`;
              default:
                return `${getVoteEmoji(vote)} ${vote}`;
            }
          };

          if (isLoading) {
            return <span>Loading...</span>;
          }

          if (error) {
            return <span>Error: {error.message}</span>;
          }

          return (
            <button
              onClick={handleVoteSubmit}
              disabled={
                buttonState === VoteButtonState.SUBMITTING || !view || !gov
              }
              className={getVoteButtonClass(vote, buttonState)}
            >
              {getButtonText()}
            </button>
          );
        };

        return <Content />;
      }}
    </PraxOnly>
  );
}
