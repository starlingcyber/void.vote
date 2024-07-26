import React from "react";
import { AccountVotingPower } from "../types/voting";
import { getVoteIcon } from "./VoteButtonPresentation";
import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-gray-800 rounded-lg p-8 border-2 border-teal-400 shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col relative"
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

            <h2
              id="modal-title"
              className="text-3xl mb-6 font-bold text-teal-400"
            >
              Select Account to Vote <VotePill vote={vote} />
            </h2>
            <p className="text-xl text-gray-400">
              You have delegations in {accountVotingPowers.length} account
              {accountVotingPowers.length !== 1 ? "s" : ""}.
            </p>
            <p className="text-xl mb-6 text-gray-400">
              You may vote using each of your accounts below:
            </p>

            <div className="overflow-y-auto flex-grow">
              {accountVotingPowers.map((account) => (
                <AccountListItem
                  key={account.accountId}
                  account={account}
                  onSelect={onSelectAccount}
                />
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-xl"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AccountListItem({
  account,
  onSelect,
}: {
  account: AccountVotingPower;
  onSelect: (accountId: number) => void;
}) {
  return (
    <button
      onClick={() => onSelect(account.accountId)}
      className="w-full text-left p-4 hover:bg-gray-700 rounded mb-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 border-2 border-slate-600"
    >
      <span className="text-xl text-teal-400 font-semibold">
        Account #{account.accountId}
      </span>
      <br />
      <span className="text-slate-200 font-semibold text-lg">
        <span className="text-orange-400">Voting Power:</span>{" "}
        {account.votingPower.toFixed(6)} UM
      </span>
    </button>
  );
}

function VotePill({ vote }: { vote: "YES" | "NO" | "ABSTAIN" }) {
  const color =
    vote === "YES"
      ? "rgb(34 197 94)"
      : vote === "NO"
        ? "rgb(220 38 38)"
        : "rgb(100 116 139)";

  const symbol = getVoteIcon(vote);

  return (
    <span
      className={`px-2 py-1 rounded text-3xl font-semibold text-white`}
      style={{
        backgroundColor: color,
      }}
    >
      {symbol} {vote}
    </span>
  );
}
