import pkg from "pg";
const { Pool } = pkg;
import { config } from "dotenv";
import type { Proposal } from "~/types/Proposal";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type Vote = "VOTE_YES" | "VOTE_NO" | "VOTE_ABSTAIN";

type ValidatorVote = {
  identity_key: string;
  vote: Vote;
  voting_power: bigint;
};

type DelegatorVote = {
  validator_identity_key: string;
  vote: Vote;
  voting_power: bigint;
};

export const getProposals = async (): Promise<Proposal[]> => {
  const client = await pool.connect();
  try {
    await client.query("SET TRANSACTION READ ONLY");
    const { rows } = await client.query<Proposal>(`
      SELECT proposal_id, title, description, kind, state, start_block_height, end_block_height, payload, proposal_deposit_amount, withdrawn, withdrawal_reason
      FROM governance_proposals
      ORDER BY proposal_id DESC
    `);
    return rows;
  } finally {
    client.release();
  }
};

export const getValidatorVotes = async (
  proposalId: number,
): Promise<ValidatorVote[]> => {
  const client = await pool.connect();
  try {
    await client.query("SET TRANSACTION READ ONLY");
    const { rows } = await client.query<ValidatorVote>(
      `
      SELECT identity_key, vote->>'vote' as vote, voting_power
      FROM governance_validator_votes
      WHERE proposal_id = $1
    `,
      [proposalId],
    );
    return rows.map((row) => ({
      ...row,
      voting_power: BigInt(row.voting_power.toString()),
    }));
  } finally {
    client.release();
  }
};

export const getDelegatorVotes = async (
  proposalId: number,
): Promise<DelegatorVote[]> => {
  const client = await pool.connect();
  try {
    await client.query("SET TRANSACTION READ ONLY");
    const { rows } = await client.query<DelegatorVote>(
      `
      SELECT identity_key as validator_identity_key, vote->>'vote' as vote, voting_power
      FROM governance_delegator_votes
      WHERE proposal_id = $1
    `,
      [proposalId],
    );
    return rows.map((row) => ({
      ...row,
      voting_power: BigInt(row.voting_power.toString()),
    }));
  } finally {
    client.release();
  }
};

export const tallyVotes = async (
  proposalId: number,
): Promise<{ yes: bigint; no: bigint; abstain: bigint }> => {
  const validatorVotes = await getValidatorVotes(proposalId);
  const delegatorVotes = await getDelegatorVotes(proposalId);

  const validatorEffectivePower: { [key: string]: bigint } = {};
  const delegatorVotesPower: { [key: string]: bigint } = {};
  const tally: { [vote in Vote]: bigint } = {
    VOTE_YES: BigInt(0),
    VOTE_NO: BigInt(0),
    VOTE_ABSTAIN: BigInt(0),
  };

  for (const vote of delegatorVotes) {
    if (!delegatorVotesPower[vote.validator_identity_key]) {
      delegatorVotesPower[vote.validator_identity_key] = BigInt(0);
    }
    delegatorVotesPower[vote.validator_identity_key] += vote.voting_power;
    tally[vote.vote] += vote.voting_power;
  }

  for (const vote of validatorVotes) {
    const validatorPower = vote.voting_power;
    const delegatorPower = delegatorVotesPower[vote.identity_key] || BigInt(0);

    const effectivePower =
      validatorPower > delegatorPower
        ? validatorPower - delegatorPower
        : BigInt(0);

    validatorEffectivePower[vote.identity_key] = effectivePower;
    tally[vote.vote] += effectivePower;
  }

  return {
    yes: tally.VOTE_YES,
    no: tally.VOTE_NO,
    abstain: tally.VOTE_ABSTAIN,
  };
};

export { pool };
