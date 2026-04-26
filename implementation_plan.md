# Technical Proposal: Transaction Processing Logic

This document outlines the proposed implementation for a robust transaction system that handles balance verification, Kowapay fee deduction, and atomic transaction recording.

## Executive Summary
The goal is to implement a script that ensures every transaction is safe from "double-spending" or "negative balance" scenarios. We will calculate a Kowapay service fee (percentage-based) and deduct both the transaction amount and the fee from the user's balance in a single atomic database operation.

## Current System Analysis

### 1. Account Schema Deficiency
The current `User` type definition in `src/types/user.ts` does not include a `balance` field. This is critical for any financial operations.

### 2. Broken `getUserBalance` Method
The existing `getUserBalance` in `src/model/transactions.ts` contains terminal logic errors:
- **Incorrect Column Query:** It filters by the `balance` column instead of the `user_id`.
- **Logic:** It should return the specific balance value rather than a full user object.

## Proposed Implementation

### Step 1: Schema & Model Updates

#### [MODIFY] [user.ts](file:///c:/Users/Administrator/Desktop/kowapay_transaction_api/src/types/user.ts)
Add `balance: number` to the `User` interface to support balance tracking.

#### [MODIFY] [transactions.ts](file:///c:/Users/Administrator/Desktop/kowapay_transaction_api/src/model/transactions.ts)
- **Fix `getUserBalance`:** Correct the SQL query to search by `user_id`.
- **Add `updateUserBalance`:** Implement a method to update a user's balance using a parameterized query.

### Step 2: Utility & Calculations

#### [NEW] [transactionUtils.ts](file:///c:/Users/Administrator/Desktop/kowapay_transaction_api/src/utils/transactionUtils.ts)
Implement `calculateKowapayFee(amount: number): number`.
- **Default Logic:** 1.5% of the transaction amount (configurable via environment variables).

### Step 3: Transaction Service Layer

#### [MODIFY] [transactionservice.ts](file:///c:/Users/Administrator/Desktop/kowapay_transaction_api/src/service/transactionservice.ts)
Create a `processComplexTransaction` method that follows this logic:
1. **Initialize DB Transaction:** Start a SQL transaction to ensure all-or-nothing execution.
2. **Lock User Row:** Fetch the user's balance using `SELECT ... FOR UPDATE` to prevent concurrent modification.
3. **Validate Funds:** Calculate `Total = Amount + KowapayFee`. Check `Balance >= Total`.
4. **Deduct Funds:** Execute the balance update.
5. **Record Transaction:** Insert the transaction record with status `completed`.
6. **Commit:** Finalize the changes if all steps succeed.

## Verification & Testing
1. **Unit Tests:** Verify fee calculation logic for various amounts.
2. **Integration Tests:** Simulation of concurrent transactions to verify row-level locking.
3. **Success/Failure Scenarios:** Verify behavior when funds are insufficient.
