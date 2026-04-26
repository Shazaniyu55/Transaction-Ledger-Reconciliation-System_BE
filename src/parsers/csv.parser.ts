import fs from 'fs';
import csvParser from 'csv-parser';
import { Transaction } from '../types';

export function buildHashMap(
  filePath: string
): Promise<Map<string, Transaction>> {
  return new Promise((resolve, reject) => {
    const map = new Map<string, Transaction>();

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: Transaction) => {
        map.set(row.transactionId, row); // O(1) insert
      })
      .on('end', () => resolve(map))
      .on('error', reject);
  });
}

export function compareWithHashMap(
  filePath: string,
  mapA: Map<string, Transaction>
): Promise<{ discrepancies: any[]; totalB: number }> {
  return new Promise((resolve, reject) => {
    const discrepancies: any[] = [];
    let totalB = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (rowB: Transaction) => {
        totalB++;
        const rowA = mapA.get(rowB.transactionId);

        if (!rowA) {
          // In B but not in A
          discrepancies.push({
            transactionId: rowB.transactionId,
            type: 'MISSING_IN_A',
          });
          return;
        }

        // Amount mismatch
        if (rowA.amount !== rowB.amount) {
          discrepancies.push({
            transactionId: rowB.transactionId,
            type: 'AMOUNT_MISMATCH',
            valueA: rowA.amount,
            valueB: rowB.amount,
          });
        }

        // Status mismatch
        if (rowA.status !== rowB.status) {
          discrepancies.push({
            transactionId: rowB.transactionId,
            type: 'STATUS_MISMATCH',
            valueA: rowA.status,
            valueB: rowB.status,
          });
        }

        // Mark as seen so we can detect MISSING_IN_B after
        mapA.delete(rowB.transactionId);
      })
      .on('end', () => {
        // Whatever remains in mapA was never matched → missing in B
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