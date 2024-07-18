import React, { useEffect, useState, useCallback } from "react";
import { useStore } from "~/state.client";
import toast from "react-hot-toast";
import { refreshPageForReconnect } from "../util";
import { PenumbraSymbol } from "@penumbra-zone/client";
import { PRAX_ORIGIN } from "~/constants";
import { CONNECT_BUTTON_BASE_CLASS } from "~/styles/sharedStyles";

// Constants
const CHROME_EXTENSION_BASE_URL = "https://chrome.google.com/webstore/detail/";
const PRAX_EXTENSION_ID = PRAX_ORIGIN.split("//")[1];

// Enum for possible button states
enum ButtonState {
  NotHydrated,
  ExtensionNotInstalled,
  Disconnected,
  Connecting,
  Connected,
  Error,
}

// Utility function to check if Prax is installed
const isPraxInstalled = (): boolean => {
  return !!window[PenumbraSymbol]?.[PRAX_ORIGIN];
};

// Function to get button text based on state
const getButtonText = (state: ButtonState, isHovering: boolean): string => {
  switch (state) {
    case ButtonState.NotHydrated:
    case ButtonState.Disconnected:
      return "Connect Prax Wallet";
    case ButtonState.ExtensionNotInstalled:
      return "Install Prax Wallet";
    case ButtonState.Connecting:
      return "Connecting...";
    case ButtonState.Connected:
      return isHovering ? "Disconnect" : "Wallet Connected";
    case ButtonState.Error:
      return "Retry Connection";
  }
};

// Function to get button CSS classes based on state
const getButtonClass = (state: ButtonState, isHovering: boolean): string => {
  switch (state) {
    case ButtonState.Connected:
      return `${CONNECT_BUTTON_BASE_CLASS} ${isHovering ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"} focus:ring-emerald-500`;
    case ButtonState.Error:
      return `${CONNECT_BUTTON_BASE_CLASS} bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500`;
    case ButtonState.NotHydrated:
    case ButtonState.Connecting:
      return `${CONNECT_BUTTON_BASE_CLASS} bg-gray-400 cursor-not-allowed`;
    case ButtonState.ExtensionNotInstalled:
      return `${CONNECT_BUTTON_BASE_CLASS} bg-purple-500 hover:bg-purple-600 focus:ring-purple-500`;
    default:
      return `${CONNECT_BUTTON_BASE_CLASS} bg-blue-500 hover:bg-blue-600 focus:ring-blue-500`;
  }
};

export default function ConnectButton() {
  const {
    requestConnection,
    checkConnectionStatus,
    connectionErr,
    connectionLoading,
    connected,
  } = useStore((state) => state.prax);

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
  }, [buttonState, isHovering, handleConnect, handleDisconnect]);

  const buttonText = getButtonText(buttonState, isHovering);
  const buttonClass = getButtonClass(buttonState, isHovering);

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
      {buttonText}
    </button>
  );
}
