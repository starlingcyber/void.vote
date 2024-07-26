import { ClientOnly } from "remix-utils/client-only";
import StakeButtonInner from "./StakeButtonInner.client";
import StakeButtonPresentation from "./StakeButtonPresentation";

export default function StakeButton({
  children,
  validatorAddress,
}: {
  children: React.ReactNode;
  validatorAddress: string;
}) {
  return (
    <ClientOnly
      fallback={
        <StakeButtonPresentation
          onClick={() => {}}
          disabled={true}
          buttonState="IDLE"
        >
          {children}
        </StakeButtonPresentation>
      }
    >
      {() => (
        <StakeButtonInner validatorAddress={validatorAddress}>
          {children}
        </StakeButtonInner>
      )}
    </ClientOnly>
  );
}
