import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useStakeService() {
  const { stakeQueryClient, connected } = useStore(
    (state: AllSlices) => state.prax,
  );

  return useQuery({
    queryKey: ["stakeService"],
    queryFn: stakeQueryClient,
    enabled: connected,
  });
}
