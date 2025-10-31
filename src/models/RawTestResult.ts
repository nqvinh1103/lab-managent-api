import { ObjectId } from 'mongodb';

export interface IRawTestResult {
  _id?: ObjectId;
  test_order_id?: ObjectId;
  barcode: string;
  instrument_id: ObjectId;
  hl7_message: string; // Raw HL7 message as string
  parsed_results?: any; // Parsed JSON representation
  status: 'pending' | 'processed' | 'synced';
  sent_at: Date;
  can_delete: boolean; // true if backed up/synced
  created_at: Date;
  created_by: ObjectId;
}

export type RawTestResultDocument = IRawTestResult & { _id: ObjectId };

export type CreateRawTestResultInput = Omit<IRawTestResult, '_id' | 'created_at'>;

