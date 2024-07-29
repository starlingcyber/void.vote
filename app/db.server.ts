import pkg from "pg";
const { Pool } = pkg;
import { config } from "dotenv";
import type { Proposal } from "~/types/Proposal";

// Load environment variables
config();

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create a new pool for database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define types for votes and voting data
type Vote = "VOTE_YES" | "VOTE_NO" | "VOTE_ABSTAIN";

type ValidatorVote = {
  identity_key: string;
  vote: Vote;
  voting_power: string; // String to represent BigInt in the database
};

type DelegatorVote = {
  validator_identity_key: string;
  vote: Vote;
  voting_power: string; // String to represent BigInt in the database
};

// Function to fetch all proposals
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

// Function to fetch validator votes for a specific proposal
export const getValidatorVotes = async (
  proposalId: number,
): Promise<ValidatorVote[]> => {
  const client = await pool.connect();
  try {
    await client.query("SET TRANSACTION READ ONLY");
    const { rows } = await client.query<ValidatorVote>(
      `
      SELECT identity_key, vote->>'vote' as vote, voting_power::text
      FROM governance_validator_votes
      WHERE proposal_id = $1
    `,
      [proposalId],
    );
    return rows;
  } finally {
    client.release();
  }
};

// Function to fetch delegator votes for a specific proposal
export const getDelegatorVotes = async (
  proposalId: number,
): Promise<DelegatorVote[]> => {
  const client = await pool.connect();
  try {
    await client.query("SET TRANSACTION READ ONLY");
    const { rows } = await client.query<DelegatorVote>(
      `
      SELECT identity_key as validator_identity_key, vote->>'vote' as vote, voting_power::text
      FROM governance_delegator_votes
      WHERE proposal_id = $1
    `,
      [proposalId],
    );
    return rows;
  } finally {
    client.release();
  }
};

// Function to tally votes
export const tallyVotes = async (
  proposalId: number,
): Promise<{ yes: string; no: string; abstain: string }> => {
  // Step 1: Fetch validator and delegator votes
  const validatorVotes = await getValidatorVotes(proposalId);
  const delegatorVotes = await getDelegatorVotes(proposalId);

  // Step 2: Initialize data structures
  const validatorEffectivePower: { [key: string]: bigint } = {};
  const delegatorVotesPower: { [key: string]: bigint } = {};
  const tally: { [vote in Vote]: bigint } = {
    VOTE_YES: BigInt(0),
    VOTE_NO: BigInt(0),
    VOTE_ABSTAIN: BigInt(0),
  };

  // Step 3: Process delegator votes
  for (const vote of delegatorVotes) {
    if (!delegatorVotesPower[vote.validator_identity_key]) {
      delegatorVotesPower[vote.validator_identity_key] = BigInt(0);
    }
    delegatorVotesPower[vote.validator_identity_key] += BigInt(
      vote.voting_power,
    );
    tally[vote.vote] += BigInt(vote.voting_power);
  }

  // Step 4: Process validator votes and compute effective voting power
  for (const vote of validatorVotes) {
    const validatorPower = BigInt(vote.voting_power);
    const delegatorPower = delegatorVotesPower[vote.identity_key] || BigInt(0);

    // Compute effective voting power
    const effectivePower =
      validatorPower > delegatorPower
        ? validatorPower - delegatorPower
        : BigInt(0);

    validatorEffectivePower[vote.identity_key] = effectivePower;
    tally[vote.vote] += effectivePower;
  }

  return {
    yes: tally.VOTE_YES.toString(),
    no: tally.VOTE_NO.toString(),
    abstain: tally.VOTE_ABSTAIN.toString(),
  };
};

export { pool };
