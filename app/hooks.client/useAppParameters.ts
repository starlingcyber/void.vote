import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useAppParameters() {
  const { viewClient, connected } = useStore((state: AllSlices) => state.prax);

  return useQuery({
    queryKey: ["appParameters"],
    queryFn: async () => {
      return (await viewClient())?.appParameters({});
    },
    enabled: connected,
  });
}
