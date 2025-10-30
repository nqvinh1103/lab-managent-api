import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { CreateEventLogInput, EventLogDocument } from '../models/EventLog';

export class EventLogService {
  private getCollection() {
    return getCollection<EventLogDocument>('event_logs');
  }

  async create(data: CreateEventLogInput) {
    try {
      const collection = this.getCollection();
      const eventLog: Omit<EventLogDocument, '_id'> = {
        ...data,
        created_at: new Date()
      };
      
      const result = await collection.insertOne(eventLog as EventLogDocument);
      return {
        success: true,
        data: { ...eventLog, _id: result.insertedId }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event log'
      };
    }
  }

  async findAll(skip: number, limit: number, filters?: {
    entity_type?: string;
    action_type?: string;
    performed_by?: string;
    start_date?: Date;
    end_date?: Date;
  }) {
    try {
      const collection = this.getCollection();
      const query: any = {};

      if (filters?.entity_type) {
        query.entity_type = filters.entity_type;
      }
      if (filters?.action_type) {
        query.action_type = filters.action_type;
      }
      if (filters?.performed_by) {
        query.performed_by = new ObjectId(filters.performed_by);
      }
      if (filters?.start_date || filters?.end_date) {
        query.created_at = {};
        if (filters.start_date) {
          query.created_at.$gte = filters.start_date;
        }
        if (filters.end_date) {
          query.created_at.$lte = filters.end_date;
        }
      }

      const data = await collection
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch event logs'
      };
    }
  }

  async findById(id: string) {
    try {
      const collection = this.getCollection();
      const data = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!data) {
        return { success: false, error: 'Event log not found' };
      }
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch event log'
      };
    }
  }

  async count() {
    try {
      const collection = this.getCollection();
      const data = await collection.countDocuments();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to count event logs'
      };
    }
  }

  async findAllWithUserInfo(skip: number, limit: number, filters?: {
    entity_type?: string;
    action_type?: string;
    performed_by?: string;
    start_date?: Date;
    end_date?: Date;
  }) {
    try {
      const collection = this.getCollection();
      const query: any = {};

      if (filters?.entity_type) {
        query.entity_type = filters.entity_type;
      }
      if (filters?.action_type) {
        query.action_type = filters.action_type;
      }
      if (filters?.performed_by) {
        query.performed_by = new ObjectId(filters.performed_by);
      }
      if (filters?.start_date || filters?.end_date) {
        query.created_at = {};
        if (filters.start_date) {
          query.created_at.$gte = filters.start_date;
        }
        if (filters.end_date) {
          query.created_at.$lte = filters.end_date;
        }
      }

      const data = await collection.aggregate([
        { $match: query },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'performed_by',
            foreignField: '_id',
            as: 'performed_by_user'
          }
        },
        {
          $unwind: {
            path: '$performed_by_user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            action_type: 1,
            entity_type: 1,
            entity_id: 1,
            performed_by: 1,
            description: 1,
            metadata: 1,
            created_at: 1,
            'performed_by_info': {
              email: '$performed_by_user.email',
              full_name: '$performed_by_user.full_name'
            }
          }
        }
      ]).toArray();

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch event logs with user info'
      };
    }
  }
}

