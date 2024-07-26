import { ClientOnly } from "remix-utils/client-only";
import StakeButtonInner from "./StakeButtonInner.client";
import StakeButtonPresentation from "./StakeButtonPresentation";

export default function StakeButton({
  validatorAddress,
}: {
  validatorAddress: string;
}) {
  return (
    <ClientOnly
      fallback={
        <StakeButtonPresentation
          onClick={() => {}}
          disabled={true}
          buttonState="IDLE"
        />
      }
    >
      {() => <StakeButtonInner validatorAddress={validatorAddress} />}
    </ClientOnly>
  );
}
