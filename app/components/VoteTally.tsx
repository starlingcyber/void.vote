import React from "react";

type VoteTallyProps = {
  yes: number;
  no: number;
  abstain: number;
};

const VoteTally: React.FC<VoteTallyProps> = ({ yes, no, abstain }) => {
  const formatVotes = (votes: number) => (votes / 1_000_000).toFixed(6);

  return (
    <div className="bg-gray-700 rounded-lg p-4 text-lg">
      <p>
        <span className="font-semibold text-green-400">Yes:</span>{" "}
        {formatVotes(yes)} UM
      </p>
      <p>
        <span className="font-semibold text-red-400">No:</span>{" "}
        {formatVotes(no)} UM
      </p>
      <p>
        <span className="font-semibold text-yellow-400">Abstain:</span>{" "}
        {formatVotes(abstain)} UM
      </p>
    </div>
  );
};

export default VoteTally;
