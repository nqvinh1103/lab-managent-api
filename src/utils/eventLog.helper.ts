import { ObjectId } from 'mongodb';
import { EventLogService } from '../services/eventLog.service';

let eventLogService: EventLogService | null = null;

const getEventLogService = () => {
  if (!eventLogService) {
    eventLogService = new EventLogService();
  }
  return eventLogService;
};

export const logEvent = async (
  actionType: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: ObjectId | string,
  performedBy: ObjectId | string | undefined,
  description: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    if (!performedBy) {
      console.warn('Event log skipped: performedBy is undefined');
      return;
    }

    await getEventLogService().create({
      action_type: actionType,
      entity_type: entityType,
      entity_id: typeof entityId === 'string' ? new ObjectId(entityId) : entityId,
      performed_by: typeof performedBy === 'string' ? new ObjectId(performedBy) : performedBy,
      description,
      metadata
    });
  } catch (error) {
    // Log silently to not affect main operation
    console.error('Failed to create event log:', error);
  }
};

