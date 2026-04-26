import { buildHashMapFromBuffer, compareBufferWithHashMap } from '../parsers/csv.parser';
import { createRun, saveDiscrepancies } from '../config/queries';

export async function runReconciliation(
  bufferA: Buffer,
  bufferB: Buffer
): Promise<any> {
  const mapA = await buildHashMapFromBuffer(bufferA);
  const totalA = mapA.size;

  const { discrepancies, totalB } = await compareBufferWithHashMap(bufferB, mapA);

  const runId = await createRun(totalA, totalB);
  await saveDiscrepancies(runId, discrepancies);

  return {
    runId,
    totalA,
    totalB,
    discrepancyCount: discrepancies.length,
    discrepancies: discrepancies.slice(0, 100),
  };
}