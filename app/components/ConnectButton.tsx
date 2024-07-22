import { ClientOnly } from "remix-utils/client-only";
import ConnectButton from "./ConnectButtonInner.client";
import { CONNECT_BUTTON_BASE_CLASS } from "~/styles/sharedStyles";
import { PRAX_CHROME_STORE_URL } from "~/constants";

export default function ConnectButtonWrapper() {
  const openChromeExtensionPage = () => {
    window.open(PRAX_CHROME_STORE_URL, "_blank");
  };

  const placeholderButton = (
    <button
      onClick={openChromeExtensionPage}
      className={`${CONNECT_BUTTON_BASE_CLASS} bg-gray-400 cursor-not-allowed`}
    >
      Loading Wallet...
    </button>
  );

  return (
    <ClientOnly fallback={placeholderButton}>
      {() => <ConnectButton />}
    </ClientOnly>
  );
}
