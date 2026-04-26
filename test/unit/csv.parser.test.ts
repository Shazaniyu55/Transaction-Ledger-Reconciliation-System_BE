import path from 'path';
import { buildHashMap, compareWithHashMap } from '../../src/parsers/csv.parser';

const fileA = path.join(__dirname, '../fixtures/fileA.csv');
const fileB = path.join(__dirname, '../fixtures/fileB.csv');

describe('buildHashMap', () => {
  it('should build a map with correct number of entries', async () => {
    const map = await buildHashMap(fileA);
    expect(map.size).toBe(4);
  });

  it('should index rows by transactionId', async () => {
    const map = await buildHashMap(fileA);
    expect(map.has('TXN001')).toBe(true);
    expect(map.get('TXN001')?.amount).toBe('500');
    expect(map.get('TXN001')?.status).toBe('SUCCESS');
  });

  it('should return empty map for empty CSV', async () => {
    // write a quick empty CSV to /tmp and test it
    const fs = await import('fs');
    const os = await import('os');
    const tmpPath = path.join(os.tmpdir(), 'empty.csv');
    fs.writeFileSync(tmpPath, 'transactionId,timestamp,amount,currency,status\n');
    const map = await buildHashMap(tmpPath);
    expect(map.size).toBe(0);
    fs.unlinkSync(tmpPath);
  });
});

describe('compareWithHashMap', () => {
  it('should detect amount mismatch', async () => {
    const map = await buildHashMap(fileA);
    const { discrepancies } = await compareWithHashMap(fileB, map);
    const mismatch = discrepancies.find(
      d => d.transactionId === 'TXN002' && d.type === 'AMOUNT_MISMATCH'
    );
    expect(mismatch).toBeDefined();
    expect(mismatch?.valueA).toBe('500');
    expect(mismatch?.valueB).toBe('9999');
  });

  it('should detect status mismatch', async () => {
    const map = await buildHashMap(fileA);
    const { discrepancies } = await compareWithHashMap(fileB, map);
    const mismatch = discrepancies.find(
      d => d.transactionId === 'TXN003' && d.type === 'STATUS_MISMATCH'
    );
    expect(mismatch).toBeDefined();
    expect(mismatch?.valueA).toBe('FAILED');
    expect(mismatch?.valueB).toBe('SUCCESS');
  });

  it('should detect transaction missing in B', async () => {
    const map = await buildHashMap(fileA);
    const { discrepancies } = await compareWithHashMap(fileB, map);
    const missing = discrepancies.find(
      d => d.transactionId === 'TXN004' && d.type === 'MISSING_IN_B'
    );
    expect(missing).toBeDefined();
  });

  it('should detect transaction missing in A', async () => {
    const map = await buildHashMap(fileA);
    const { discrepancies } = await compareWithHashMap(fileB, map);
    const missing = discrepancies.find(
      d => d.transactionId === 'TXN005' && d.type === 'MISSING_IN_A'
    );
    expect(missing).toBeDefined();
  });

  it('should return correct totalB count', async () => {
    const map = await buildHashMap(fileA);
    const { totalB } = await compareWithHashMap(fileB, map);
    expect(totalB).toBe(4);
  });
});