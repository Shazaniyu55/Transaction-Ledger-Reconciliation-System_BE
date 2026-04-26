import path from 'path';

// Mock the DB module before importing service
jest.mock('../../src/db/queries', () => ({
  createRun: jest.fn().mockResolvedValue('mock-run-id-123'),
  saveDiscrepancies: jest.fn().mockResolvedValue(undefined),
}));

// Mock fs.unlink so temp files aren't deleted during tests
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  unlink: jest.fn((path, cb) => cb(null)),
}));

import { runReconciliation } from '../../src/services/reconcile.service';
import { createRun, saveDiscrepancies } from '../../src/db/queries';

const fileA = path.join(__dirname, '../fixtures/fileA.csv');
const fileB = path.join(__dirname, '../fixtures/fileB.csv');

describe('runReconciliation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a runId', async () => {
    const result = await runReconciliation(fileA, fileB);
    expect(result.runId).toBe('mock-run-id-123');
  });

  it('should return correct totalA and totalB', async () => {
    const result = await runReconciliation(fileA, fileB);
    expect(result.totalA).toBe(4);
    expect(result.totalB).toBe(4);
  });

  it('should call createRun with correct totals', async () => {
    await runReconciliation(fileA, fileB);
    expect(createRun).toHaveBeenCalledWith(4, 4);
  });

  it('should call saveDiscrepancies with runId and discrepancies', async () => {
    await runReconciliation(fileA, fileB);
    expect(saveDiscrepancies).toHaveBeenCalledWith(
      'mock-run-id-123',
      expect.any(Array)
    );
  });

  it('should detect 4 discrepancies total', async () => {
    const result = await runReconciliation(fileA, fileB);
    expect(result.discrepancyCount).toBe(4);
  });

  it('should include discrepancies in response', async () => {
    const result = await runReconciliation(fileA, fileB);
    expect(result.discrepancies.length).toBeGreaterThan(0);
  });
});