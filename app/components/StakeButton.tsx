import React, { useState, useMemo } from "react";
import PraxOnly from "./PraxOnly";
import { toast } from "react-hot-toast";
import {
  Address,
  AddressIndex,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb";
import { BalancesResponse } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb";

// Utility functions
const formatAmount = (amount: bigint): string =>
  (Number(amount) / 1e6).toFixed(6);

// Function to list upenumbra balances by account index
import { BalancesResponse } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb";

function listUpenumbraBalancesByAccountIndex(
  balancesResponse: BalancesResponse[],
): Record<number, string> {
  console.log("Processing balances...");
  return balancesResponse.reduce(
    (acc, entry, index) => {
      console.log(`Processing entry ${index}:`, JSON.stringify(entry, null, 2));

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

      console.log(
        `Account: ${accountIndex}, Base: ${baseDenom}, Symbol: ${symbol}, Amount: ${amount}`,
      );

      if (
        accountIndex !== undefined &&
        (baseDenom === "upenumbra" || symbol === "UM") &&
        amount !== undefined
      ) {
        console.log(`Adding balance for account ${accountIndex}: ${amount}`);
        acc[accountIndex] = amount;
      } else {
        console.log(`Skipping entry: conditions not met`);
      }

      return acc;
    },
    {} as Record<number, string>,
  );
}

// Sub-components
const AccountSelector = ({
  account,
  onIncrement,
  onDecrement,
  disablePrev,
  disableNext,
}) => (
  <div className="flex items-center mb-4">
    <label htmlFor="account" className="block text-gray-300 mr-2">
      Account
    </label>
    <div className="flex items-center">
      <button
        onClick={onDecrement}
        disabled={disablePrev}
        className="bg-gray-700 text-white px-3 py-2 rounded-l-md hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        ←
      </button>
      <input
        type="number"
        id="account"
        value={account}
        readOnly
        className="bg-gray-700 text-white border-y-2 border-gray-600 p-2 w-20 focus:outline-none focus:border-amber-400 text-center"
      />
      <button
        onClick={onIncrement}
        disabled={disableNext}
        className="bg-gray-700 text-white px-3 py-2 rounded-r-md hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        →
      </button>
    </div>
  </div>
);

const AmountInput = ({ amount, maxAmount, onChange, onSetMax }) => (
  <div className="flex items-center mb-4">
    <input
      type="number"
      value={amount}
      onChange={onChange}
      className="bg-gray-700 text-white border-2 border-gray-600 rounded-l-md p-2 w-full focus:outline-none focus:border-amber-400"
      placeholder="Amount in UM"
    />
    <button
      onClick={onSetMax}
      className="bg-teal-600 text-white px-4 py-2 rounded-r-md hover:bg-teal-700 transition-colors"
    >
      MAX
    </button>
  </div>
);

// Main component
export default function StakeButton({
  validatorAddress,
}: {
  validatorAddress: string;
}) {
  return (
    <PraxOnly
      fallback={<span className="text-gray-400">Connect wallet to stake</span>}
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
}) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(0);

  const viewQuery = useView.default();
  const stakeQuery = useStakeService.default();
  const balancesQuery = useBalances.default(
    new AddressIndex({ account: selectedAccount }),
  );

  const { buttonState, handleStakeSubmit } = useStake.default(
    viewQuery.data,
    stakeQuery.data,
    validatorAddress,
  );

  // Process balance data
  const { balance, maxAmount, availableAccounts } = useMemo(() => {
    if (balancesQuery.isLoading || !balancesQuery.data) {
      console.log("Balances query is loading or has no data");
      return { balance: BigInt(0), maxAmount: "0", availableAccounts: [0] };
    }

    console.log(
      "Raw balances data:",
      JSON.stringify(balancesQuery.data, null, 2),
    );

    const balancesByAccount = listUpenumbraBalancesByAccountIndex(
      balancesQuery.data,
    );
    console.log("Balances by account:", balancesByAccount);

    const accounts = Object.keys(balancesByAccount)
      .map(Number)
      .sort((a, b) => a - b);
    console.log("Available accounts:", accounts);

    const selectedBalance = BigInt(balancesByAccount[selectedAccount] || "0");
    console.log(
      "Selected account:",
      selectedAccount,
      "Balance:",
      selectedBalance.toString(),
    );

    return {
      balance: selectedBalance,
      maxAmount: formatAmount(selectedBalance),
      availableAccounts: accounts.length > 0 ? accounts : [0],
    };
  }, [balancesQuery.data, balancesQuery.isLoading, selectedAccount]);

  // Event handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (
      value === "" ||
      (Number(value) >= 0 && Number(value) <= Number(maxAmount))
    ) {
      setAmount(value);
    }
  };

  const handleSetMaxAmount = () => setAmount(maxAmount);

  const handleAccountChange = (increment: boolean) => {
    const currentIndex = availableAccounts.indexOf(selectedAccount);
    const newIndex = increment ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < availableAccounts.length) {
      setSelectedAccount(availableAccounts[newIndex]);
    }
  };

  const handleStake = () => {
    const stakeAmount = BigInt(Math.floor(Number(amount) * 1e6));
    if (stakeAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    handleStakeSubmit(
      stakeAmount,
      new AddressIndex({ account: selectedAccount }),
    );
    setShowModal(false);
  };

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
        className={`px-4 py-2 rounded-md font-bold text-white transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 w-64 h-12 flex items-center justify-center text-xl border-2 ${
          buttonState === "IDLE"
            ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 border-amber-400"
            : buttonState === "ERROR"
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-600 border-red-400"
              : "bg-gray-700 border-gray-600 cursor-not-allowed"
        }`}
      >
        {balancesQuery.isLoading ? "Loading..." : "Stake"}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-teal-400 shadow-lg max-w-md w-full">
            <h2 className="text-3xl mb-4 font-bold text-teal-400">Stake UM</h2>

            <AccountSelector
              account={selectedAccount}
              onIncrement={() => handleAccountChange(true)}
              onDecrement={() => handleAccountChange(false)}
              disablePrev={availableAccounts.indexOf(selectedAccount) === 0}
              disableNext={
                availableAccounts.indexOf(selectedAccount) ===
                availableAccounts.length - 1
              }
            />

            <AmountInput
              amount={amount}
              maxAmount={maxAmount}
              onChange={handleAmountChange}
              onSetMax={handleSetMaxAmount}
            />

            <p className="text-gray-400 mb-4">
              Available balance: {maxAmount} UM
            </p>

            {balancesQuery.isLoading && (
              <p className="text-yellow-400 mb-4">Loading balance...</p>
            )}
            {balancesQuery.isError && (
              <p className="text-red-400 mb-4">Error loading balance</p>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStake}
                disabled={balancesQuery.isLoading || balancesQuery.isError}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Stake
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
