import React from "react";
import { Link, useLocation } from "@remix-run/react";
import ConnectButton from "./ConnectButton";
import StakeButton from "./StakeButton";
import { VALIDATOR_ADDRESS } from "~/constants";

const Header: React.FC = () => {
  const location = useLocation();
  const isFlipped = location.pathname === "/faq";

  return (
    <>
      <h1 className="text-center text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500">
        Penumbra Governance
      </h1>
      <h2 className="text-center text-3xl font-bold mb-10">
        <span className="text-teal-600">brought to you by</span>{" "}
        <a
          className="text-amber-400 underline"
          href="https://starlingcyber.net"
          target="_blank"
          rel="noopener noreferrer"
        >
          Starling Cybernetics
        </a>
      </h2>

      <div className="mb-8 flex justify-center">
        <ConnectButton />
        <StakeButton validatorAddress={VALIDATOR_ADDRESS} />
      </div>
    </>
  );
};

export default Header;
