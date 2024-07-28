export type Proposal = {
  proposal_id: bigint;
  title: string;
  description: string;
  kind: any;
  state: any;
  start_block_height: bigint;
  end_block_height: bigint;
  payload: any;
  proposal_deposit_amount: bigint;
  withdrawn: boolean;
  withdrawal_reason: string | null;
  tally?: {
    yes: bigint;
    no: bigint;
    abstain: bigint;
  };
};
