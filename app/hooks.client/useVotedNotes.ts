import { NoteView } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb";
import { useQuery } from "@tanstack/react-query";
import { AllSlices, useStore } from "~/state.client";

export default function useVotedNotes() {
  const { viewClient, connected } = useStore((state: AllSlices) => state.prax);

  return useQuery({
    queryKey: ["votedNotes"],
    queryFn: async () => {
      const responses = (await viewClient())?.transactionInfo({});
      let votedNotes: Array<{ proposal: bigint; note: NoteView }> = new Array();
      if (responses) {
        for await (const response of responses) {
          const actions = response.txInfo?.view?.bodyView?.actionViews!;
          actions.forEach((action) => {
            const view = action?.actionView;
            if (view.case === "delegatorVote") {
              const delegatorVote = view.value?.delegatorVote;
              if (delegatorVote.case === "visible") {
                const proposal =
                  delegatorVote.value?.delegatorVote?.body?.proposal!;
                const note = delegatorVote.value?.note!;
                votedNotes.push({
                  proposal,
                  note,
                });
              }
            }
          });
        }
        return votedNotes;
      } else return [];
    },
    enabled: connected,
  });
}
