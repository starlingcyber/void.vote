import { useEffect, useState, useCallback } from "react";
import { useStore } from "~/state.client";
import toast from "react-hot-toast";
import { refreshPageForReconnect } from "../util";
import { PenumbraSymbol } from "@penumbra-zone/client";
import { PRAX_CHROME_STORE_URL, PRAX_ORIGIN } from "~/constants";
import { CONNECT_BUTTON_BASE_CLASS } from "~/styles/sharedStyles";

enum ButtonState {
  NotHydrated,
  ExtensionNotInstalled,
  Disconnected,
  Connecting,
  Connected,
  Error,
}

export const isPraxInstalled = (): boolean => {
  return !!window[PenumbraSymbol]?.[PRAX_ORIGIN];
};

const getButtonText = (state: ButtonState, isHovering: boolean): string => {
  switch (state) {
    case ButtonState.NotHydrated:
    case ButtonState.Disconnected:
      return "Connect Wallet";
    case ButtonState.ExtensionNotInstalled:
      return "Install Prax Wallet";
    case ButtonState.Connecting:
      return "Connecting...";
    case ButtonState.Connected:
      return isHovering ? "Disconnect Wallet" : "Wallet Connected";
    case ButtonState.Error:
      return "Retry Connection";
  }
};

const getButtonClass = (state: ButtonState, isHovering: boolean): string => {
  const baseClass = `${CONNECT_BUTTON_BASE_CLASS} border-2`;
  switch (state) {
    case ButtonState.Connected:
      return `${baseClass} ${isHovering ? "bg-red-600 hover:bg-red-700 border-red-400" : "bg-blue-600 hover:bg-blue-700 border-blue-400"} focus:ring-blue-600`;
    case ButtonState.Error:
      return `${baseClass} bg-red-500 hover:bg-red-600 focus:ring-red-500 border-red-300`;
    case ButtonState.NotHydrated:
    case ButtonState.Connecting:
      return `${baseClass} bg-blue-600 hover:bg-blue-700 border-blue-400 focus:ring-blue-600 cursor-wait animate-pulse`;
    // case ButtonState.ExtensionNotInstalled:
    default:
      return `${baseClass} bg-purple-700 hover:bg-purple-800 focus:ring-purple-600 border-purple-400`;
    // default:
    //   return `${baseClass} bg-teal-600 hover:bg-teal-700 focus:ring-teal-600 border-teal-400`;
  }
};

const getButtonIcon = (state: ButtonState, isHovering: boolean): string => {
  switch (state) {
    case ButtonState.Connected:
      return isHovering ? "⛓️‍💥 " : "🔗 ";
    case ButtonState.Error:
      return "↪ ";
    case ButtonState.ExtensionNotInstalled:
      return "📥 ";
    default:
      return "🔗 ";
  }
};

export default function ConnectButton() {
  const {
    requestConnection,
    checkConnectionStatus,
    connectionErr,
    connectionLoading,
    connected,
  } = useStore((state: any) => state.prax);

  const [buttonState, setButtonState] = useState<ButtonState>(
    ButtonState.NotHydrated,
  );
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isPraxInstalled()) {
      setButtonState(ButtonState.ExtensionNotInstalled);
    } else {
      handleInitialConnection();
    }
  }, []);

  useEffect(() => {
    if (!isPraxInstalled()) {
      setButtonState(ButtonState.ExtensionNotInstalled);
    } else if (connected) {
      setButtonState(ButtonState.Connected);
    } else if (connectionLoading) {
      setButtonState(ButtonState.Connecting);
    } else if (connectionErr) {
      setButtonState(ButtonState.Error);
    } else {
      setButtonState(ButtonState.Disconnected);
    }
  }, [connected, connectionLoading, connectionErr]);

  const handleInitialConnection = useCallback(() => {
    const url = new URL(window.location.href);
    const shouldReconnect = url.searchParams.get("reconnect") === "true";

    if (shouldReconnect) {
      url.searchParams.delete("reconnect");
      window.history.replaceState({}, "", url.toString());
      handleConnect();
    } else {
      checkConnectionStatus();
    }
  }, [checkConnectionStatus]);

  const handleConnect = useCallback(async () => {
    if (
      buttonState === ButtonState.Connecting ||
      buttonState === ButtonState.Connected
    )
      return;

    try {
      toast.loading("Requesting wallet connection...", { id: "connect" });
      await requestConnection();
      const isConnected = checkConnectionStatus();
      if (isConnected) {
        // toast.success("Successfully connected!");
      } else {
        throw new Error("Connection failed unexpectedly");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`${errorMessage}: try unlocking wallet?`, {
        duration: 5000,
        id: "connect",
      });
    } finally {
      toast.dismiss("connect");
    }
  }, [buttonState, requestConnection, checkConnectionStatus]);

  const handleDisconnect = useCallback(async () => {
    try {
      const provider = window[PenumbraSymbol]?.[PRAX_ORIGIN];

      if (provider && provider.disconnect) {
        await provider.disconnect();
        toast.success("Wallet disconnected successfully");
        // Trigger a full page refresh after disconnection
        window.location.reload();
      } else {
        throw new Error("Disconnect method not available");
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast.error("Failed to disconnect wallet. Please try again.");
    }
  }, []);

  const handleClick = useCallback(() => {
    switch (buttonState) {
      case ButtonState.NotHydrated:
      case ButtonState.Connecting:
        return;
      case ButtonState.Connected:
        if (isHovering) {
          handleDisconnect();
        }
        return;
      case ButtonState.ExtensionNotInstalled:
        window.open(PRAX_CHROME_STORE_URL, "_blank");
        break;
      case ButtonState.Error:
        refreshPageForReconnect();
        break;
      case ButtonState.Disconnected:
        handleConnect();
        break;
    }
  }, [buttonState, isHovering, handleConnect, handleDisconnect]);

  const buttonText = getButtonText(buttonState, isHovering);
  const buttonClass = getButtonClass(buttonState, isHovering);
  const buttonIcon = getButtonIcon(buttonState, isHovering);

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={
        buttonState === ButtonState.NotHydrated ||
        buttonState === ButtonState.Connecting
      }
      className={buttonClass}
    >
      {buttonIcon}
      {buttonText}
    </button>
  );
}
