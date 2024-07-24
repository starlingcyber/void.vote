import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useStakeService() {
  const { stakeClient, connected } = useStore((state: AllSlices) => state.prax);

  return useQuery({
    queryKey: ["stakeService"],
    queryFn: stakeClient,
    enabled: connected,
  });
}
