import React, { useState } from "react";
import ConnectButton from "./ConnectButton";
import StakeButton from "./StakeButton";
import { VALIDATOR_ADDRESS } from "~/constants";

import { useNavigate } from "@remix-run/react";

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header>
      <h1 className="text-center text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
        Penumbra Governance
      </h1>
      <h2 className="text-center text-3xl font-bold mb-10">
        <span className="text-teal-600">brought to you by</span>{" "}
        <a
          className="text-amber-400 hover:text-amber-300 underline"
          href="https://starlingcyber.net"
          target="_blank"
          rel="noopener noreferrer"
        >
          Starling Cybernetics
        </a>
      </h2>
      <div className="mb-8 flex justify-center items-center space-x-4">
        <ConnectButton />
        <StakeButton validatorAddress={VALIDATOR_ADDRESS}>📈 Stake</StakeButton>
        <button
          onClick={() => navigate("#faq")}
          className="px-4 py-2 rounded-md font-bold text-white transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 w-36 h-12 flex items-center justify-center text-2xl border-2 bg-teal-600 hover:bg-teal-700 focus:ring-teal-600 border-teal-400"
        >
          ❔ Info
        </button>
      </div>
    </header>
  );
};

export default Header;
