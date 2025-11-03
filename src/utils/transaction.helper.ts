import { ClientSession, MongoError, MongoServerError } from 'mongodb';
import { getClient } from '../config/database';

export type TransactionCallback<T> = (session: ClientSession) => Promise<T>;

/**
 * Execute operations within a MongoDB transaction
 * Handles session lifecycle, commits on success, aborts on error
 * 
 * @param callback - Function that performs operations using the session
 * @param options - Transaction options (readPreference, readConcern, writeConcern)
 * @returns Result of the callback function
 * @throws Error if transaction fails
 */
export async function withTransaction<T>(
  callback: TransactionCallback<T>,
  options?: {
    maxCommitTimeMS?: number;
    readConcern?: { level: 'local' | 'available' | 'majority' | 'snapshot' | 'linearizable' };
    readPreference?: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
    writeConcern?: { w?: number | 'majority'; j?: boolean; wtimeout?: number };
  }
): Promise<T> {
  const client = getClient();
  const session = client.startSession();

  try {
    let result: T;

    // Execute operations within transaction
    await session.withTransaction(
      async () => {
        result = await callback(session);
      },
      {
        maxCommitTimeMS: options?.maxCommitTimeMS || 10000,
        readConcern: options?.readConcern,
        readPreference: options?.readPreference,
        writeConcern: options?.writeConcern
      }
    );

    // Return result after successful commit
    return result!;
  } catch (error) {
    // Transaction automatically aborted
    if (error instanceof MongoError) {
      // Handle specific transaction errors
      const errorCode = typeof error.code === 'number' ? error.code : 0;
      
      if (errorCode === 50 || (error instanceof MongoServerError && error.codeName === 'MaxTimeMSExpired')) {
        throw new Error('Transaction timeout: Operation took too long to complete');
      }
      if (errorCode === 251 || (error instanceof MongoServerError && error.codeName === 'NoSuchTransaction')) {
        throw new Error('Transaction error: No active transaction');
      }
      if (errorCode === 117 || (error instanceof MongoServerError && error.codeName === 'Interrupted')) {
        throw new Error('Transaction error: Operation was interrupted');
      }
    }

    // Re-throw error after abort
    throw error;
  } finally {
    // Always end session
    await session.endSession();
  }
}

/**
 * Check if an error is a transient transaction error that can be retried
 */
export function isTransientTransactionError(error: unknown): boolean {
  if (!(error instanceof MongoError)) {
    return false;
  }

  // Transient transaction error codes
  const transientCodes = [
    251, // NoSuchTransaction
    50,  // MaxTimeMSExpired
    117, // Interrupted
    133, // TransientTransactionError
  ];

  const errorCode = typeof error.code === 'number' ? error.code : 0;
  return transientCodes.includes(errorCode) || 
         error.errorLabels?.includes('TransientTransactionError') === true;
}

