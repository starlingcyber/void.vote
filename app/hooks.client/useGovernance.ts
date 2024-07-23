import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useGovernance() {
  const { govQueryClient, connected } = useStore(
    (state: AllSlices) => state.prax,
  );

  return useQuery({
    queryKey: ["governance"],
    queryFn: govQueryClient,
    enabled: connected,
  });
}
