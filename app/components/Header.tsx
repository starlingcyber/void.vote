import React, { useState } from "react";
import ConnectButton from "./ConnectButton";
import StakeButton from "./StakeButton";
import { VALIDATOR_ADDRESS } from "~/constants";

import { useNavigate } from "@remix-run/react";
import FAQButton from "./FAQButton";

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header>
      <h1 className="text-center text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
        Penumbra Governance
      </h1>
      <h2 className="flex flex-col sm:flex-row justify-center items-center text-center text-3xl font-bold mb-10">
        <span className="text-teal-600 mb-2 sm:mb-0">brought to you by</span>
        <span className="sm:ml-3">
          <a
            className="text-amber-400 hover:text-amber-300"
            href="https://starlingcyber.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Starling Cybernetics
          </a>
        </span>
      </h2>
      <div className="mb-8 flex justify-center items-center space-x-4">
        <ConnectButton />
        <StakeButton validatorAddress={VALIDATOR_ADDRESS}>📈 Stake</StakeButton>
        <FAQButton />
      </div>
    </header>
  );
};

export default Header;
