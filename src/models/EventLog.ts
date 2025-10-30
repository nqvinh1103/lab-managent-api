import { ObjectId } from 'mongodb';

export interface IEventLog {
  _id?: ObjectId;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_type: string;
  entity_id: ObjectId;
  performed_by: ObjectId;
  description: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export type EventLogDocument = IEventLog & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateEventLogInput = Omit<IEventLog, '_id' | 'created_at'>;

