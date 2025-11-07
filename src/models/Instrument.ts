import { ObjectId } from 'mongodb';

export interface IInstrument {
  _id?: ObjectId;
  instrument_name: string;
  instrument_type: string;
  serial_number: string;
  mode: 'ready' | 'maintenance' | 'inactive'; // Operational mode
  mode_reason?: string; // Reason for maintenance/inactive mode
  last_qc_check?: Date; // Last quality control check timestamp
  deactivated_at?: Date; // Set when mode='inactive', cleared when mode='ready'
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

export type CreateInstrumentInput = Omit<IInstrument, '_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
export type UpdateInstrumentInput = Partial<Omit<IInstrument, '_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>>;
