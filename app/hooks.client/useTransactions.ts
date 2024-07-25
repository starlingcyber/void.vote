import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useTransactions() {
  const { viewClient, connected } = useStore((state: AllSlices) => state.prax);

  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = (await viewClient())?.transactionInfo({});
      if (response) {
        return Array.fromAsync(response);
      } else return [];
    },
    enabled: connected,
  });
}
