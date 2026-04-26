import { buildHashMap, compareWithHashMap } from '../parsers/csv.parser';
import { createRun, saveDiscrepancies } from '../config/queries';
import fs from 'fs';

export async function runReconciliation(
  fileAPath: string,
  fileBPath: string
): Promise<any> {
  try {
    // Step 1: Stream file A into a HashMap
    const mapA = await buildHashMap(fileAPath);
    const totalA = mapA.size;

    // Step 2: Stream file B, compare row by row
    const { discrepancies, totalB } = await compareWithHashMap(fileBPath, mapA);

    // Step 3: Save run to DB
    const runId = await createRun(totalA, totalB);

    // Step 4: Bulk save discrepancies
    await saveDiscrepancies(runId, discrepancies);

    return {
      runId,
      totalA,
      totalB,
      discrepancyCount: discrepancies.length,
      discrepancies: discrepancies.slice(0, 100), // first page inline
    };
  } finally {
    // Always clean up temp files
    fs.unlink(fileAPath, () => {});
    fs.unlink(fileBPath, () => {});
  }
}