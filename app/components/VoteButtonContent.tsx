import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  VoteButtonPresentation,
  VoteButtonState,
} from "./VoteButtonPresentation";
import AccountSelectionModal from "./AccountSelectionModal";
import { AccountVotingPower } from "../types/voting";

interface VoteButtonContentProps {
  proposalId: bigint;
  vote: "YES" | "NO" | "ABSTAIN";
  useView: any;
  useGovernance: any;
  useVote: any;
  useVotingPower: any;
}

export default function VoteButtonContent({
  proposalId,
  vote,
  useView,
  useGovernance,
  useVote,
  useVotingPower,
}: VoteButtonContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  const viewQuery = useView();
  const govQuery = useGovernance();
  const { data: votingPowerData, isLoading: isLoadingVotingPower } =
    useVotingPower(proposalId);

  const view = viewQuery.data;
  const gov = govQuery.data;
  const isLoading =
    viewQuery.isLoading || govQuery.isLoading || isLoadingVotingPower;
  const error = viewQuery.error || govQuery.error;

  const { buttonState, handleVoteSubmit } = useVote(
    view,
    gov,
    proposalId,
    vote,
    selectedAccount,
  );

  const submitVote = useCallback(() => {
    if (selectedAccount !== null) {
      handleVoteSubmit();
    }
  }, [selectedAccount, handleVoteSubmit]);

  const handleClick = useCallback(() => {
    if (!votingPowerData || votingPowerData.length === 0) {
      toast.error("No accounts with voting power available");
      return;
    }

    if (votingPowerData.length === 1) {
      setSelectedAccount(votingPowerData[0].accountId);
      submitVote();
    } else {
      setIsModalOpen(true);
    }
  }, [votingPowerData, submitVote]);

  const handleAccountSelect = useCallback((accountId: number) => {
    setSelectedAccount(accountId);
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (selectedAccount !== null && !isModalOpen) {
      submitVote();
    }
  }, [selectedAccount, isModalOpen, submitVote]);

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
    <>
      <VoteButtonPresentation
        vote={vote}
        buttonState={buttonState}
        onClick={handleClick}
        disabled={
          !view || !gov || !votingPowerData || votingPowerData.length === 0
        }
      />
      <AccountSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAccount={handleAccountSelect}
        accountVotingPowers={votingPowerData || []}
        vote={vote}
      />
    </>
  );
}
