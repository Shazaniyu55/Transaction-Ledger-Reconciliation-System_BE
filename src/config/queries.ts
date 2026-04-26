import  pool  from './db';
import { Discrepancy } from '../types';

export async function createRun(
  totalA: number,
  totalB: number
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO reconciliation_runs (total_a, total_b)
     VALUES ($1, $2) RETURNING id`,
    [totalA, totalB]
  );
  return result.rows[0].id;
}

export async function saveDiscrepancies(
  runId: string,
  discrepancies: Discrepancy[]
): Promise<void> {
  if (discrepancies.length === 0) return;

  // Build bulk insert — much faster than inserting one by one
  const values: any[] = [];
  const placeholders = discrepancies.map((d, i) => {
    const base = i * 5;
    values.push(runId, d.transactionId, d.type, d.valueA ?? null, d.valueB ?? null);
    return `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5})`;
  });

  await pool.query(
    `INSERT INTO discrepancies (run_id, transaction_id, type, value_a, value_b)
     VALUES ${placeholders.join(', ')}`,
    values
  );
}

export async function getDiscrepancies(
  runId: string,
  page: number,
  limit: number
) {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT * FROM discrepancies
     WHERE run_id = $1
     ORDER BY type
     LIMIT $2 OFFSET $3`,
    [runId, limit, offset]
  );
  return result.rows;
}