export interface Transaction {
  transactionId: string;
  timestamp: string;
  amount: string;
  currency: string;
  status: string;
}

export type DiscrepancyType =
  | 'MISSING_IN_B'
  | 'MISSING_IN_A'
  | 'AMOUNT_MISMATCH'
  | 'STATUS_MISMATCH';

export interface Discrepancy {
  transactionId: string;
  type: DiscrepancyType;
  valueA?: string;
  valueB?: string;
}

export interface ReconcileResult {
  runId: string;
  totalA: number;
  totalB: number;
  discrepancyCount: number;
  discrepancies: Discrepancy[];
}