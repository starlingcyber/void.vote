import React, { useState } from "react";
import BigNumber from "bignumber.js";

type VoteTallyBarProps = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
  proposalId: bigint;
  active: boolean;
};

const VoteTallyBar: React.FC<VoteTallyBarProps> = ({
  yes,
  no,
  abstain,
  proposalId,
  active,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const yesNum = new BigNumber(yes.toString());
  const noNum = new BigNumber(no.toString());
  const abstainNum = new BigNumber(abstain.toString());

  const total = yesNum.plus(noNum).plus(abstainNum);

  // Check if total is 0 to avoid division by zero
  const yesPercentage = total.isZero()
    ? new BigNumber(0)
    : yesNum.dividedBy(total).times(100);
  const noPercentage = total.isZero()
    ? new BigNumber(0)
    : noNum.dividedBy(total).times(100);
  const abstainPercentage = total.isZero()
    ? new BigNumber(0)
    : abstainNum.dividedBy(total).times(100);

  const formatVotes = (votes: BigNumber) =>
    votes.dividedBy(1_000_000).toFormat(0);
  const formatPercentage = (percentage: BigNumber) => percentage.toFixed(2);

  if (total.isZero()) {
    return (
      <div className="w-full text-center p-6 font-bold bg-gray-700 rounded-lg text-gray-300 text-xl">
        No votes {active ? "have been yet" : "were"} cast on Proposal #
        {proposalId.toString()}.
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gray-700 rounded-lg text-gray-300 text-lg">
      <div className="relative h-8 flex rounded-full overflow-hidden cursor-help">
        <div
          className="bg-green-500 h-full"
          style={{ width: `${yesPercentage.toNumber()}%` }}
          onMouseEnter={() => setHoveredSection("yes")}
          onMouseLeave={() => setHoveredSection(null)}
        ></div>
        <div
          className="bg-red-500 h-full"
          style={{ width: `${noPercentage.toNumber()}%` }}
          onMouseEnter={() => setHoveredSection("no")}
          onMouseLeave={() => setHoveredSection(null)}
        ></div>
        <div
          className="bg-slate-500 h-full"
          style={{ width: `${abstainPercentage.toNumber()}%` }}
          onMouseEnter={() => setHoveredSection("abstain")}
          onMouseLeave={() => setHoveredSection(null)}
        ></div>
      </div>
      {hoveredSection && (
        <div className="mt-2 text-center">
          {hoveredSection === "yes" && (
            <span className="">
              <span className="font-bold text-green-400">Yes:</span>{" "}
              <span className="font-semibold text-gray-100">
                {formatVotes(yesNum)} UM
              </span>{" "}
              ({formatPercentage(yesPercentage)}%)
            </span>
          )}
          {hoveredSection === "no" && (
            <span className="">
              <span className="font-bold text-red-400">No:</span>{" "}
              <span className="font-semibold text-gray-100">
                {formatVotes(noNum)} UM
              </span>{" "}
              ({formatPercentage(noPercentage)}%)
            </span>
          )}
          {hoveredSection === "abstain" && (
            <span className="">
              <span className="font-bold text-slate-100">Abstain:</span>{" "}
              <span className="font-semibold text-gray-100">
                {formatVotes(abstainNum)} UM
              </span>{" "}
              ({formatPercentage(abstainPercentage)}%)
            </span>
          )}
        </div>
      )}
      {!hoveredSection && (
        <div className="mt-2 text-center text-gray-300">
          <span className="text-orange-400 font-semibold">Total Votes:</span>{" "}
          <span className="font-semibold text-gray-200">
            {formatVotes(total)} UM
          </span>
          <span className="text-slate-400">
            {" "}
            | Hover over sections for details
          </span>
        </div>
      )}
    </div>
  );
};

export default VoteTallyBar;
