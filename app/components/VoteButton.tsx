import React, { useState, useEffect, useCallback } from "react";
import PraxOnly from "./PraxOnly";
import {
  VoteButtonPresentation,
  VoteButtonState,
} from "./VoteButtonPresentation";
import { AccountVotingPower } from "../hooks.client/useAllAccountsVotingPower";
import { toast } from "react-hot-toast";

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
        useAllAccountsVotingPower: () =>
          import("~/hooks.client/useAllAccountsVotingPower"),
      }}
    >
      {({ useView, useGovernance, useVote, useAllAccountsVotingPower }) => (
        <VoteButtonContent
          proposalId={proposalId}
          vote={vote}
          useView={useView.default}
          useGovernance={useGovernance.default}
          useVote={useVote.useVote}
          useAllAccountsVotingPower={
            useAllAccountsVotingPower.useAllAccountsVotingPower
          }
        />
      )}
    </PraxOnly>
  );
}

function VoteButtonContent({
  proposalId,
  vote,
  useView,
  useGovernance,
  useVote,
  useAllAccountsVotingPower,
}: VoteButtonProps & {
  useView: any;
  useGovernance: any;
  useVote: any;
  useAllAccountsVotingPower: any;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  const viewQuery = useView();
  const govQuery = useGovernance();
  const { data: accountVotingPowers, isLoading: isLoadingVotingPower } =
    useAllAccountsVotingPower(proposalId);

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
    } else {
      toast.error("Please select an account to vote with");
    }
  }, [selectedAccount, handleVoteSubmit]);

  useEffect(() => {
    if (!isModalOpen && selectedAccount !== null) {
      submitVote();
    }
  }, [isModalOpen, selectedAccount, submitVote]);

  useEffect(() => {
    if (accountVotingPowers && accountVotingPowers.length === 1) {
      setSelectedAccount(accountVotingPowers[0].accountId);
    } else {
      setSelectedAccount(null);
    }
  }, [accountVotingPowers]);

  const handleClick = () => {
    if (!accountVotingPowers || accountVotingPowers.length === 0) {
      toast.error("No accounts with voting power available");
      return;
    }

    if (accountVotingPowers.length === 1) {
      setSelectedAccount(accountVotingPowers[0].accountId);
      submitVote();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleAccountSelect = (accountId: number) => {
    console.log("Selected account:", accountId);
    setSelectedAccount(accountId);
    setIsModalOpen(false);
  };

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
          !view ||
          !gov ||
          !accountVotingPowers ||
          accountVotingPowers.length === 0
        }
      />
      <AccountSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAccount={handleAccountSelect}
        accountVotingPowers={accountVotingPowers || []}
        vote={vote}
      />
    </>
  );
}

function AccountSelectionModal({
  isOpen,
  onClose,
  onSelectAccount,
  accountVotingPowers,
  vote,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (accountId: number) => void;
  accountVotingPowers: AccountVotingPower[];
  vote: "YES" | "NO" | "ABSTAIN";
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-8 border-2 border-teal-400 shadow-lg w-full max-w-3xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full p-1"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-3xl mb-6 font-bold text-teal-400">
          Select Account to Vote {vote}
        </h2>

        {accountVotingPowers.map((account) => (
          <button
            key={account.accountId}
            onClick={() => onSelectAccount(account.accountId)}
            className="w-full text-left p-4 hover:bg-gray-700 rounded mb-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <span className="text-xl font-semibold">
              Account: {account.accountId}
            </span>
            <br />
            <span className="text-teal-400">
              Voting Power: {account.votingPower.toFixed(6)} UM
            </span>
          </button>
        ))}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
