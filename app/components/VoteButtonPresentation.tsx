import React from "react";

export enum VoteButtonState {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUBMITTING = "SUBMITTING",
  ERROR = "ERROR",
}

const VOTE_BUTTON_BASE_CLASS = `
  px-4 py-2 rounded-md font-bold text-white transition-all duration-100 ease-in-out
  focus:outline-none focus:ring-2 focus:ring-offset-2
  w-64 h-12 flex items-center justify-center text-xl
`;

const getVoteButtonClass = (vote: string, state: VoteButtonState) => {
  let colorClass = "";
  switch (vote) {
    case "YES":
      colorClass = "bg-green-500 hover:bg-green-600 focus:ring-green-500";
      break;
    case "NO":
      colorClass = "bg-red-500 hover:bg-red-600 focus:ring-red-500";
      break;
    case "ABSTAIN":
      colorClass = "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500";
      break;
  }

  if (state === VoteButtonState.LOADING) {
    colorClass = "bg-gray-300 cursor-not-allowed";
  } else if (state === VoteButtonState.SUBMITTING) {
    colorClass = "bg-gray-400 cursor-not-allowed";
  } else if (state === VoteButtonState.ERROR) {
    colorClass = "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500";
  }

  return `${VOTE_BUTTON_BASE_CLASS} ${colorClass}`;
};

const getVoteEmoji = (vote: string) => {
  switch (vote) {
    case "YES":
      return "👍";
    case "NO":
      return "👎";
    case "ABSTAIN":
      return "🤐";
    default:
      return "";
  }
};

interface VoteButtonPresentationProps {
  vote: "YES" | "NO" | "ABSTAIN";
  buttonState: VoteButtonState;
  onClick: () => void;
  disabled: boolean;
}

export const VoteButtonPresentation: React.FC<VoteButtonPresentationProps> = ({
  vote,
  buttonState,
  onClick,
  disabled,
}) => {
  const getButtonText = () => {
    switch (buttonState) {
      case VoteButtonState.LOADING:
        return "Loading...";
      case VoteButtonState.SUBMITTING:
        return "Submitting...";
      case VoteButtonState.ERROR:
        return `Retry ${vote}`;
      default:
        return `${getVoteEmoji(vote)} ${vote}`;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={
        disabled ||
        buttonState === VoteButtonState.LOADING ||
        buttonState === VoteButtonState.SUBMITTING
      }
      className={getVoteButtonClass(vote, buttonState)}
    >
      {getButtonText()}
    </button>
  );
};
