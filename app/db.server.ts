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

export const tallyVotes = async (
  proposalId: number,
): Promise<{ yes: number; no: number; abstain: number }> => {
  const client = await pool.connect();
  try {
    await client.query("SET TRANSACTION READ ONLY");
    const { rows } = await client.query(
      `
      WITH validator_votes AS (
        SELECT
          identity_key,
          (vote->>'vote') AS vote,
          voting_power
        FROM governance_validator_votes
        WHERE proposal_id = $1
      ),
      delegator_votes AS (
        SELECT
          identity_key,
          (vote->>'vote') AS vote,
          voting_power
        FROM governance_delegator_votes
        WHERE proposal_id = $1
      ),
      combined_votes AS (
        SELECT
          COALESCE(v.identity_key, d.identity_key) AS identity_key,
          COALESCE(d.vote, v.vote) AS vote,
          CASE
            WHEN d.vote IS NOT NULL THEN d.voting_power
            ELSE COALESCE(v.voting_power, 0)
          END AS voting_power
        FROM validator_votes v
        FULL OUTER JOIN delegator_votes d ON v.identity_key = d.identity_key
      )
      SELECT
        COALESCE(SUM(CASE WHEN vote = 'VOTE_YES' THEN voting_power ELSE 0 END), 0) AS yes,
        COALESCE(SUM(CASE WHEN vote = 'VOTE_NO' THEN voting_power ELSE 0 END), 0) AS no,
        COALESCE(SUM(CASE WHEN vote = 'VOTE_ABSTAIN' THEN voting_power ELSE 0 END), 0) AS abstain
      FROM combined_votes
    `,
      [proposalId],
    );

    return rows[0];
  } finally {
    client.release();
  }
};

export { pool };
