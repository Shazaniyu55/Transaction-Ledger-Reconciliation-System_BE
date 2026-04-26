import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { Transaction } from '../types';

export function buildHashMapFromBuffer(
  buffer: Buffer
): Promise<Map<string, Transaction>> {
  return new Promise((resolve, reject) => {
    const map = new Map<string, Transaction>();

    Readable.from(buffer)
      .pipe(csvParser())
      .on('data', (row: Transaction) => {
        map.set(row.transactionId, row);
      })
      .on('end', () => resolve(map))
      .on('error', reject);
  });
}

export function compareBufferWithHashMap(
  buffer: Buffer,
  mapA: Map<string, Transaction>
): Promise<{ discrepancies: any[]; totalB: number }> {
  return new Promise((resolve, reject) => {
    const discrepancies: any[] = [];
    let totalB = 0;

    Readable.from(buffer)
      .pipe(csvParser())
      .on('data', (rowB: Transaction) => {
        totalB++;
        const rowA = mapA.get(rowB.transactionId);

        if (!rowA) {
          discrepancies.push({
            transactionId: rowB.transactionId,
            type: 'MISSING_IN_A',
          });
          return;
        }

        if (rowA.amount !== rowB.amount) {
          discrepancies.push({
            transactionId: rowB.transactionId,
            type: 'AMOUNT_MISMATCH',
            valueA: rowA.amount,
            valueB: rowB.amount,
          });
        }

        if (rowA.status !== rowB.status) {
          discrepancies.push({
            transactionId: rowB.transactionId,
            type: 'STATUS_MISMATCH',
            valueA: rowA.status,
            valueB: rowB.status,
          });
        }

        mapA.delete(rowB.transactionId);
      })
      .on('end', () => {
        for (const [txnId] of mapA) {
          discrepancies.push({
            transactionId: txnId,
            type: 'MISSING_IN_B',
          });
        }
        resolve({ discrepancies, totalB });
      })
      .on('error', reject);
  });
}