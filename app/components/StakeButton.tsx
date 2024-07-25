import React, { useState, useMemo, useCallback } from "react";
import PraxOnly from "./PraxOnly";
import { toast } from "react-hot-toast";
import { BalancesResponse } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb";

// Utility functions
const formatAmount = (amount: bigint): string =>
  (Number(amount) / 1e6).toFixed(6);

// Function to list upenumbra balances by account index
function listUpenumbraBalancesByAccountIndex(
  balancesResponse: BalancesResponse[],
): Record<number, string> {
  return balancesResponse.reduce(
    (acc, entry) => {
      let accountIndex: number | undefined;
      let amount: string | undefined;
      let baseDenom: string | undefined;
      let symbol: string | undefined;

      if (entry.accountAddress?.addressView?.case === "decoded") {
        accountIndex = entry.accountAddress?.addressView?.value?.index?.account;
      }

      if (entry.balanceView?.valueView.case === "knownAssetId") {
        const knownAsset = entry.balanceView.valueView.value;
        amount = knownAsset.amount?.lo?.toString();
        baseDenom = knownAsset.metadata?.base;
        symbol = knownAsset.metadata?.symbol;
      }

      if (
        accountIndex !== undefined &&
        (baseDenom === "upenumbra" || symbol === "UM") &&
        amount !== undefined
      ) {
        acc[accountIndex] = amount;
      }

      return acc;
    },
    {} as Record<number, string>,
  );
}

// Sub-components
// Updated AccountSelector component
const AccountSelector = ({
  account,
  onAccountChange,
  availableAccounts,
  onInputChange,
}: {
  account: number;
  onAccountChange: (newAccount: number) => void;
  availableAccounts: number[];
  onInputChange: (inputValue: number) => void;
}) => (
  <div className="flex items-center">
    <button
      onClick={() => onAccountChange(Math.max(0, account - 1))}
      disabled={account === Math.min(...availableAccounts)}
      className="bg-gray-700 text-white px-3 py-2 rounded-l-md hover:bg-gray-600 transition-colors disabled:opacity-50 h-10 focus:outline-none focus:ring-2 focus:ring-gray-500 text-xl"
    >
      ←
    </button>
    <input
      type="number"
      id="account"
      value={account}
      onChange={(e) => {
        const newAccount = Number(e.target.value);
        onInputChange(newAccount);
      }}
      onBlur={() => onAccountChange(account)}
      className="bg-gray-700 text-white border-y-2 border-gray-600 p-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-center h-10 text-lg"
    />
    <button
      onClick={() =>
        onAccountChange(Math.min(account + 1, Math.max(...availableAccounts)))
      }
      disabled={account === Math.max(...availableAccounts)}
      className="bg-gray-700 text-white px-3 py-2 rounded-r-md hover:bg-gray-600 transition-colors disabled:opacity-50 h-10 focus:outline-none focus:ring-2 focus:ring-gray-500 text-xl"
    >
      →
    </button>
  </div>
);

const AmountInput = ({
  amount,
  onChange,
  onBlur,
  onSetMax,
}: {
  amount: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onSetMax: () => void;
}) => (
  <div className="flex items-center">
    <input
      type="number"
      id="amount"
      value={amount}
      onChange={onChange}
      onBlur={onBlur}
      className="bg-gray-700 text-white border-2 border-gray-600 rounded-l-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 h-10 text-lg"
      placeholder="Enter amount"
    />
    <button
      onClick={onSetMax}
      className="bg-teal-600 text-white px-4 py-2 rounded-r-md hover:bg-teal-700 transition-colors h-10 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-lg"
    >
      MAX
    </button>
  </div>
);

const StakeModal = ({
  isOpen,
  onClose,
  selectedAccount,
  availableAccounts,
  onAccountChange,
  amount,
  maxAmount,
  onAmountChange,
  onAmountBlur,
  onSetMaxAmount,
  onStake,
  isLoading,
  isError,
  inputAccount,
  onInputAccountChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAccount: number;
  availableAccounts: number[];
  onAccountChange: (newAccount: number) => void;
  amount: string;
  maxAmount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAmountBlur: () => void;
  onSetMaxAmount: () => void;
  onStake: () => void;
  isLoading: boolean;
  isError: boolean;
  inputAccount: number;
  onInputAccountChange: (inputValue: number) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-8 border-2 border-teal-400 shadow-lg w-full max-w-3xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
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
          Stake with{" "}
          <a
            href="https://starlingcyber.net"
            target="_blank"
            className="underline text-amber-400 hover:text-amber-300"
          >
            Starling Cybernetics
          </a>
        </h2>
        <p className="text-xl mb-8 text-gray-400">
          By staking with us, you can earn rewards, help secure the Penumbra
          network, and support our work building tools like this.
        </p>

        <div className="grid grid-cols-2 gap-6 mt-6 mb-6">
          <div>
            <label
              htmlFor="account"
              className="block text-gray-300 mb-2 font-semibold"
            >
              Select Account
            </label>
            <AccountSelector
              account={inputAccount}
              onAccountChange={onAccountChange}
              availableAccounts={availableAccounts}
              onInputChange={onInputAccountChange}
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-gray-300 mb-2 font-semibold"
            >
              Stake Amount (UM)
            </label>
            <AmountInput
              amount={amount}
              onChange={onAmountChange}
              onBlur={onAmountBlur}
              onSetMax={onSetMaxAmount}
            />
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg px-4 py-3 mb-8">
          <p className="text-gray-300 font-semibold text-lg">
            Account Balance:{" "}
            <span className="text-teal-400 ml-2">{maxAmount} UM</span>
          </p>
        </div>

        {isLoading && (
          <p className="text-yellow-400 mb-4">Loading balance...</p>
        )}
        {isError && <p className="text-red-400 mb-4">Error loading balance</p>}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-xl"
          >
            Cancel
          </button>
          <button
            onClick={onStake}
            disabled={isLoading || isError}
            className="px-5 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 border-2 border-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-xl"
          >
            Stake
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function StakeButton({
  validatorAddress,
}: {
  validatorAddress: string;
}) {
  return (
    <PraxOnly
      fallback={null}
      imports={{
        useStake: () => import("~/hooks.client/useStake"),
        useView: () => import("~/hooks.client/useView"),
        useBalances: () => import("~/hooks.client/useBalances"),
        useStakeService: () => import("~/hooks.client/useStakeService"),
      }}
    >
      {({ useStake, useView, useBalances, useStakeService }) => (
        <StakeButtonContent
          useStake={useStake}
          useView={useView}
          useBalances={useBalances}
          useStakeService={useStakeService}
          validatorAddress={validatorAddress}
        />
      )}
    </PraxOnly>
  );
}

function StakeButtonContent({
  useStake,
  useView,
  useBalances,
  useStakeService,
  validatorAddress,
}: {
  useStake: any;
  useView: any;
  useBalances: any;
  useStakeService: any;
  validatorAddress: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountStakeAmounts, setAccountStakeAmounts] = useState<
    Record<number, string>
  >({});

  const viewQuery = useView.default();
  const stakeQuery = useStakeService.default();
  const { account, setAccount, buttonState, handleStakeSubmit } =
    useStake.default(viewQuery.data, stakeQuery.data, validatorAddress);
  const [inputAccount, setInputAccount] = useState(account.toString());

  const balancesQuery = useBalances.default();

  const { balance, maxAmount, availableAccounts, balancesByAccount } =
    useMemo(() => {
      if (balancesQuery.isLoading || !balancesQuery.data) {
        return {
          balance: BigInt(0),
          maxAmount: "0",
          availableAccounts: [0],
          balancesByAccount: {},
        };
      }

      const balancesByAccount = listUpenumbraBalancesByAccountIndex(
        balancesQuery.data,
      );
      const accounts = Object.keys(balancesByAccount)
        .map(Number)
        .sort((a, b) => a - b);
      const selectedBalance = BigInt(balancesByAccount[account] || "0");

      return {
        balance: selectedBalance,
        maxAmount: formatAmount(selectedBalance),
        availableAccounts: accounts.length > 0 ? accounts : [0],
        balancesByAccount,
      };
    }, [balancesQuery.data, balancesQuery.isLoading, account]);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAmount = e.target.value;
      setAmount(newAmount);
      setAccountStakeAmounts((prev) => ({
        ...prev,
        [account]: newAmount,
      }));
    },
    [account],
  );

  const handleAmountBlur = useCallback(() => {
    const numAmount = Number(amount);
    const numMaxAmount = Number(maxAmount);
    if (numAmount > numMaxAmount) {
      setAmount(maxAmount);
      setAccountStakeAmounts((prev) => ({
        ...prev,
        [account]: maxAmount,
      }));
    }
  }, [amount, maxAmount, account]);

  const handleSetMaxAmount = useCallback(() => {
    setAmount(maxAmount);
    setAccountStakeAmounts((prev) => ({
      ...prev,
      [account]: maxAmount,
    }));
  }, [maxAmount, account]);

  const handleAccountChange = useCallback(
    (newAccount: number) => {
      if (availableAccounts.includes(newAccount)) {
        setAccount(newAccount);
        setInputAccount(newAccount.toString());

        const previousAmount = accountStakeAmounts[newAccount] || amount;
        const newMaxAmount = formatAmount(
          BigInt(balancesByAccount[newAccount] || "0"),
        );
        const cappedAmount = Math.min(
          Number(previousAmount),
          Number(newMaxAmount),
        ).toString();

        setAmount(cappedAmount);
        setAccountStakeAmounts((prev) => ({
          ...prev,
          [newAccount]: cappedAmount,
        }));
      } else {
        setInputAccount(account.toString());
      }
    },
    [
      availableAccounts,
      amount,
      accountStakeAmounts,
      balancesByAccount,
      setAccount,
      account,
    ],
  );

  const handleAccountInputChange = useCallback((inputValue: number) => {
    setInputAccount(inputValue.toString());
  }, []);

  const handleStake = useCallback(() => {
    const stakeAmount = BigInt(Math.floor(Number(amount) * 1e6));
    if (stakeAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    handleStakeSubmit(stakeAmount).then(() => {
      // Manually trigger a refetch of the balances after successful submission
      balancesQuery.refetch();
    });
    setShowModal(false);
  }, [amount, balance, handleStakeSubmit, balancesQuery]);

  // Render
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={
          buttonState === "LOADING" ||
          buttonState === "SUBMITTING" ||
          balancesQuery.isLoading
        }
        className={`mx-5 px-4 py-2 rounded-md font-bold text-white transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 w-48 h-12 flex items-center justify-center text-2xl border-2 ${
          buttonState === "IDLE" || buttonState === "ERROR"
            ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 border-amber-400"
            : buttonState === "SUBMITTING"
              ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 border-amber-400 cursor-wait animate-pulse"
              : buttonState === "LOADING"
                ? "bg-gray-700 border-gray-600 cursor-not-allowed"
                : ""
        }`}
      >
        📈 Stake
      </button>

      <StakeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedAccount={account}
        availableAccounts={availableAccounts}
        onAccountChange={handleAccountChange}
        amount={amount}
        maxAmount={maxAmount}
        onAmountChange={handleAmountChange}
        onAmountBlur={handleAmountBlur}
        onSetMaxAmount={handleSetMaxAmount}
        onStake={handleStake}
        isLoading={balancesQuery.isLoading}
        isError={balancesQuery.isError}
        inputAccount={parseInt(inputAccount)}
        onInputAccountChange={handleAccountInputChange}
      />
    </>
  );
}
