export type ButtonState = "IDLE" | "LOADING" | "SUBMITTING" | "ERROR";

export interface StakeButtonPresentationProps {
  onClick: () => void;
  disabled: boolean;
  buttonState: ButtonState;
}

export default function StakeButtonPresentation({
  children,
  onClick,
  disabled,
  buttonState,
}: StakeButtonPresentationProps & { children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-bold text-white transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 w-44 h-12 flex items-center justify-center text-2xl border-2 ${
        buttonState === "IDLE" || buttonState === "ERROR"
          ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 border-amber-400"
          : buttonState === "SUBMITTING"
            ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 border-amber-400 cursor-wait animate-pulse"
            : buttonState === "LOADING"
              ? "bg-gray-700 border-gray-600 cursor-not-allowed"
              : ""
      }`}
    >
      {children}
    </button>
  );
}
