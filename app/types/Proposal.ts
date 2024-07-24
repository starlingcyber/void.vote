export type Proposal = {
  proposal_id: number;
  title: string;
  description: string;
  kind: any;
  state: any;
  start_block_height: number;
  end_block_height: number;
  payload: any;
  proposal_deposit_amount: number;
  withdrawn: boolean;
  withdrawal_reason: string | null;
  tally?: {
    yes: number;
    no: number;
    abstain: number;
  };
};
