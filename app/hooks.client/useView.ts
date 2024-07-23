import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useView() {
  const { viewClient, connected } = useStore((state: AllSlices) => state.prax);

  return useQuery({
    queryKey: ["view"],
    queryFn: viewClient,
    enabled: connected,
  });
}
