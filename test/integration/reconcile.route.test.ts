import request from 'supertest';
import path from 'path';
import app from '../../src/index';

// Mock the service — integration test only tests HTTP layer
jest.mock('../../src/services/reconcile.service', () => ({
  runReconciliation: jest.fn().mockResolvedValue({
    runId: 'test-run-id',
    totalA: 4,
    totalB: 4,
    discrepancyCount: 4,
    discrepancies: [
      { transactionId: 'TXN002', type: 'AMOUNT_MISMATCH', valueA: '500', valueB: '9999' },
    ],
  }),
}));

const fileA = path.join(__dirname, '../fixtures/fileA.csv');
const fileB = path.join(__dirname, '../fixtures/fileB.csv');

describe('POST /api/reconcile', () => {
  it('should return 200 with reconciliation result', async () => {
    const res = await request(app)
      .post('/api/reconcile')
      .attach('fileA', fileA)
      .attach('fileB', fileB);

    expect(res.status).toBe(200);
    expect(res.body.runId).toBe('test-run-id');
    expect(res.body.discrepancyCount).toBe(4);
  });

  it('should return 400 if fileA is missing', async () => {
    const res = await request(app)
      .post('/api/reconcile')
      .attach('fileB', fileB);   // only send fileB

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 400 if fileB is missing', async () => {
    const res = await request(app)
      .post('/api/reconcile')
      .attach('fileA', fileA);   // only send fileA

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 400 if no files sent', async () => {
    const res = await request(app)
      .post('/api/reconcile');

    expect(res.status).toBe(400);
  });

  it('should return discrepancies array in response', async () => {
    const res = await request(app)
      .post('/api/reconcile')
      .attach('fileA', fileA)
      .attach('fileB', fileB);

    expect(Array.isArray(res.body.discrepancies)).toBe(true);
  });
});