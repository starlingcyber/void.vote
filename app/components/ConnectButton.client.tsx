import React, { useEffect, useState, useCallback } from "react";
import { useStore } from "~/state.client";
import toast from "react-hot-toast";
import { refreshPageForReconnect } from "~/util";
import { PenumbraSymbol } from "@penumbra-zone/client";
import { PRAX_ORIGIN } from "~/constants";

// Constants
const CHROME_EXTENSION_BASE_URL = "https://chrome.google.com/webstore/detail/";

// Extract extension ID from PRAX_ORIGIN
const PRAX_EXTENSION_ID = PRAX_ORIGIN.split("//")[1];

// Function to check if Prax is installed
const isPraxInstalled = (): boolean => {
  return !!window[PenumbraSymbol]?.[PRAX_ORIGIN];
};

// Define the possible button states
enum ButtonState {
  NotHydrated,
  ExtensionNotInstalled,
  Disconnected,
  Connecting,
  Connected,
  Error,
}

// Determine the appropriate button text based on the current state
const getButtonText = (state: ButtonState): string => {
  switch (state) {
    case ButtonState.NotHydrated:
      return "Connect Wallet";
    case ButtonState.ExtensionNotInstalled:
      return "Install Prax Wallet";
    case ButtonState.Disconnected:
      return "Connect Wallet";
    case ButtonState.Connecting:
      return "Connecting...";
    case ButtonState.Connected:
      return "Connected";
    case ButtonState.Error:
      return "Retry Connection";
  }
};

// Generate the button's CSS classes based on its current state
const getButtonClass = (state: ButtonState): string => {
  const baseClass =
    "px-4 py-2 rounded-md font-bold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

  let colorClass: string;
  let stateClass: string;

  switch (state) {
    case ButtonState.Connected:
      colorClass = "bg-green-500 hover:bg-green-600";
      stateClass = "hover:transform hover:-translate-y-1";
      break;
    case ButtonState.Error:
      colorClass = "bg-yellow-500 hover:bg-yellow-600";
      stateClass = "hover:transform hover:-translate-y-1";
      break;
    case ButtonState.NotHydrated:
    case ButtonState.Connecting:
      colorClass = "bg-blue-500";
      stateClass = "opacity-50 cursor-not-allowed";
      break;
    case ButtonState.ExtensionNotInstalled:
      colorClass = "bg-purple-500 hover:bg-purple-600";
      stateClass = "hover:transform hover:-translate-y-1";
      break;
    default:
      colorClass = "bg-blue-500 hover:bg-blue-600";
      stateClass = "hover:transform hover:-translate-y-1";
  }

  return `${baseClass} ${colorClass} ${stateClass}`;
};

export default function ConnectButton() {
  // Extract relevant state from the global store
  const {
    requestConnection,
    checkConnectionStatus,
    connectionErr,
    connectionLoading,
    connected,
  } = useStore((state) => state.prax);

  // Local state to track the button state
  const [buttonState, setButtonState] = useState<ButtonState>(
    ButtonState.NotHydrated,
  );

  // Effect to run once on component mount
  useEffect(() => {
    if (!isPraxInstalled()) {
      setButtonState(ButtonState.ExtensionNotInstalled);
    } else {
      handleInitialConnection();
    }
  }, []);

  // Update button state based on connection status
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

  // Handle the initial connection state, including potential reconnection attempts
  const handleInitialConnection = useCallback(() => {
    const url = new URL(window.location.href);
    const shouldReconnect = url.searchParams.get("reconnect") === "true";

    if (shouldReconnect) {
      // Clear the reconnect parameter from the URL
      url.searchParams.delete("reconnect");
      window.history.replaceState({}, "", url.toString());
      handleConnect();
    } else {
      checkConnectionStatus();
    }
  }, [checkConnectionStatus]);

  // Attempt to establish a connection
  const handleConnect = useCallback(async () => {
    if (
      buttonState === ButtonState.Connecting ||
      buttonState === ButtonState.Connected
    )
      return;

    try {
      await requestConnection();
      const isConnected = checkConnectionStatus();
      if (isConnected) {
        toast.success("Successfully connected!");
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Error: ${errorMessage}. Click to try again.`, {
        duration: 5000,
        position: "top-center",
      });
    }
  }, [buttonState, requestConnection, checkConnectionStatus]);

  // Handle button click events
  const handleClick = useCallback(() => {
    switch (buttonState) {
      case ButtonState.NotHydrated:
      case ButtonState.Connecting:
      case ButtonState.Connected:
        return;
      case ButtonState.ExtensionNotInstalled:
        window.open(
          `${CHROME_EXTENSION_BASE_URL}${PRAX_EXTENSION_ID}`,
          "_blank",
        );
        break;
      case ButtonState.Error:
        refreshPageForReconnect();
        break;
      case ButtonState.Disconnected:
        handleConnect();
        break;
    }
  }, [buttonState, handleConnect]);

  // Derive button text and CSS class from the current state
  const buttonText = getButtonText(buttonState);
  const buttonClass = getButtonClass(buttonState);

  return (
    <button
      onClick={handleClick}
      disabled={
        buttonState === ButtonState.NotHydrated ||
        buttonState === ButtonState.Connecting
      }
      className={buttonClass}
    >
      {buttonText}
    </button>
  );
}
