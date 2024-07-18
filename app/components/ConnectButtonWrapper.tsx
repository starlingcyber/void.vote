import React, { useState, useEffect } from "react";
import { ClientOnly } from "remix-utils/client-only";
import ConnectButton from "./ConnectButton.client";
import { CONNECT_BUTTON_BASE_CLASS } from "~/styles/sharedStyles";

export default function ConnectButtonWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const placeholderButton = (
    <button
      disabled
      className={`${CONNECT_BUTTON_BASE_CLASS} bg-gray-400 cursor-not-allowed`}
    >
      Connect Wallet
    </button>
  );

  return (
    <ClientOnly fallback={placeholderButton}>
      {() => (isClient ? <ConnectButton /> : placeholderButton)}
    </ClientOnly>
  );
}
