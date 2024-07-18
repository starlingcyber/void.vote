import React, { useState, useEffect } from "react";
import { ClientOnly } from "remix-utils/client-only";
import ConnectButton from "./ConnectButton.client";

export default function ConnectButtonWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const placeholderButton = (
    <button
      disabled
      className="px-4 py-2 rounded-md font-bold text-white bg-blue-500 opacity-50 cursor-not-allowed"
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
