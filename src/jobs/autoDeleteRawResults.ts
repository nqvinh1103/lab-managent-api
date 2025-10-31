import { RawTestResultService } from '../services/rawTestResult.service';
import { logEvent } from '../utils/eventLog.helper';
import { ObjectId } from 'mongodb';

const service = new RawTestResultService();

/**
 * Auto-delete raw test results older than configured days
 * Run this as a cron job (e.g., daily at midnight)
 * 
 * Usage:
 * - Import and call autoDeleteRawResults() in your scheduler
 * - Or set up node-cron: cron.schedule('0 0 * * *', autoDeleteRawResults)
 */
export async function autoDeleteRawResults(daysOld: number = 30): Promise<void> {
  console.log(`🔄 Running auto-delete job for raw results older than ${daysOld} days...`);

  try {
    const result = await service.autoDelete(daysOld);

    if (result.success) {
      console.log(`✅ Auto-deleted ${result.data} raw test results`);

      // Log event with system user (can be configured)
      const systemUserId = new ObjectId('000000000000000000000000'); // System user placeholder
      await logEvent(
        'DELETE',
        'RawTestResult',
        'batch',
        systemUserId,
        `Auto-deleted ${result.data} raw test results older than ${daysOld} days`,
        { deleted_count: result.data, days_old: daysOld }
      );
    } else {
      console.error(`❌ Auto-delete job failed: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Error in auto-delete job:', error);
  }
}

// Example: Uncomment to run as standalone script
// autoDeleteRawResults(30);

