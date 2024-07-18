import React, { useState, useEffect } from "react";
import { ClientOnly } from "remix-utils/client-only";
import ConnectButton from "./ConnectButton.client";
import { CONNECT_BUTTON_BASE_CLASS } from "~/styles/sharedStyles";
import { PRAX_CHROME_STORE_URL } from "~/constants";

export default function ConnectButtonWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openChromeExtensionPage = () => {
    window.open(PRAX_CHROME_STORE_URL, "_blank");
  };

  const placeholderButton = (
    <button
      onClick={openChromeExtensionPage}
      className={`${CONNECT_BUTTON_BASE_CLASS} bg-purple-500 hover:bg-purple-600 focus:ring-purple-500`}
    >
      Install Prax Wallet
    </button>
  );

  return (
    <ClientOnly fallback={placeholderButton}>
      {() => (isClient ? <ConnectButton /> : placeholderButton)}
    </ClientOnly>
  );
}
