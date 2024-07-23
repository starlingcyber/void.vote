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

export { pool };
