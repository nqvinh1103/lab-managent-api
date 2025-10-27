import { ObjectId } from 'mongodb';

export interface IInstrument {
  _id?: ObjectId;
  instrument_name: string;
  instrument_type: string;
  serial_number: string;
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  is_active: boolean;
  deactivated_at?: Date;
  auto_delete_scheduled_at?: Date;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type InstrumentDocument = IInstrument & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateInstrumentInput = Omit<IInstrument, '_id' | 'created_at' | 'updated_at'>;
export type UpdateInstrumentInput = Partial<Omit<IInstrument, '_id' | 'created_at' | 'updated_at'>>;
