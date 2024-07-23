import React from "react";
import PraxOnly from "./PraxOnly";
import {
  VoteButtonPresentation,
  VoteButtonState,
} from "./VoteButtonPresentation";
import { useVote } from "../hooks.client/useVote";

interface VoteButtonProps {
  proposalId: number;
  vote: "YES" | "NO" | "ABSTAIN";
}

export default function VoteButton({ proposalId, vote }: VoteButtonProps) {
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
          const viewQuery = useView.default();
          const govQuery = useGovernance.default();

          const view = viewQuery.data;
          const gov = govQuery.data;
          const isLoading = viewQuery.isLoading || govQuery.isLoading;
          const error = viewQuery.error || govQuery.error;

          const { buttonState, handleVoteSubmit } = useVote(
            view,
            gov,
            proposalId,
            vote,
          );

          React.useEffect(() => {
            console.log("Button state:", buttonState);
          }, [buttonState]);

          if (isLoading) {
            return (
              <VoteButtonPresentation
                vote={vote}
                buttonState={VoteButtonState.LOADING}
                onClick={() => {}}
                disabled={true}
              />
            );
          }

          if (error) {
            console.error("Error in VoteButton:", error);
            return (
              <VoteButtonPresentation
                vote={vote}
                buttonState={VoteButtonState.ERROR}
                onClick={() => {}}
                disabled={true}
              />
            );
          }

          return (
            <VoteButtonPresentation
              vote={vote}
              buttonState={buttonState}
              onClick={handleVoteSubmit}
              disabled={!view || !gov}
            />
          );
        };

        return <Content />;
      }}
    </PraxOnly>
  );
}
