import React from "react";
import { AccountVotingPower } from "../types/voting";

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (accountId: number) => void;
  accountVotingPowers: AccountVotingPower[];
  vote: "YES" | "NO" | "ABSTAIN";
}

export default function AccountSelectionModal({
  isOpen,
  onClose,
  onSelectAccount,
  accountVotingPowers,
  vote,
}: AccountSelectionModalProps) {
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
