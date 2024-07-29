import React from "react";
import StakeButton from "./StakeButton";
import { VALIDATOR_ADDRESS } from "~/constants";

const StakingInfoPanel: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border-2 border-teal-600">
      <h3 className="text-3xl font-bold mb-7 text-teal-400">
        Stake $UM to Vote on Penumbra
      </h3>
      <div className="text-gray-300 text-xl space-y-5 mb-8">
        <p>
          <b className="text-orange-400">
            You need to stake $UM tokens to vote.
          </b>{" "}
          You can only vote on a governance proposal if you were already staking{" "}
          <i>before</i> the proposal was submitted.
        </p>
        <p>
          <b className="text-orange-400">
            The more you stake, the more your vote will count.
          </b>{" "}
          Your voting power is equal to the value of your stake at the time a
          proposal is submitted.
        </p>
      </div>
      <div className="flex items-center space-x-6">
        <StakeButton validatorAddress={VALIDATOR_ADDRESS}>
          Stake Now
        </StakeButton>
        <a
          href="#faq/how-to-stake"
          className="text-teal-400 hover:text-teal-300 underline text-xl"
        >
          Learn More
        </a>
      </div>
    </div>
  );
};

export default StakingInfoPanel;
