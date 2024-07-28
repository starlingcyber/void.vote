import React from "react";
import PraxOnly from "./PraxOnly";
import VoteButtonContent from "./VoteButtonContent";
import useBalances from "~/hooks.client/useBalances";

interface VoteButtonProps {
  proposalId: bigint;
  vote: "YES" | "NO" | "ABSTAIN";
}

export default function VoteButton({ proposalId, vote }: VoteButtonProps) {
  return (
    <PraxOnly
      fallback={<span>Connect wallet to vote</span>}
      imports={{
        useView: () => import("~/hooks.client/useView"),
        useGovernance: () => import("~/hooks.client/useGovernance"),
        useVote: () => import("~/hooks.client/useVote"),
        useVotingPower: () => import("~/hooks.client/useVotingPower"),
        useBalances: () => import("~/hooks.client/useBalances"),
      }}
    >
      {({ useView, useGovernance, useVote, useVotingPower, useBalances }) => (
        <VoteButtonContent
          proposalId={proposalId}
          vote={vote}
          useView={useView.default}
          useGovernance={useGovernance.default}
          useVote={useVote.useVote}
          useVotingPower={useVotingPower.default}
          useBalances={useBalances.default}
        />
      )}
    </PraxOnly>
  );
}
