import { ObjectId } from 'mongodb';

export interface ITestResult {
  parameter_id: ObjectId;
  result_value: number;
  unit: string;
  reference_range_text?: string;
  is_flagged: boolean;
  reagent_lot_number?: string;
  measured_at: Date;
}

export interface ITestComment {
  comment_text: string;
  created_by: ObjectId;
  created_at: Date;
  deleted_at?: Date;
  updated_at: Date;
  updated_by: ObjectId;
}

export interface ITestOrder {
  _id?: ObjectId;
  order_number: string;
  patient_id: ObjectId;
  barcode?: string;
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'failed';
  instrument_id?: ObjectId;
  test_results: ITestResult[];
  comments: ITestComment[];
  run_by?: ObjectId;
  run_at?: Date;
  created_at: Date;
  created_by: ObjectId;
  updated_at: Date;
  updated_by: ObjectId;
}

export type TestOrderDocument = ITestOrder & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export type CreateTestOrderInput = Omit<ITestOrder, '_id' | 'created_at' | 'updated_at' | 'test_results' | 'comments'>;
export type UpdateTestOrderInput = Partial<Omit<ITestOrder, '_id' | 'created_at' | 'updated_at' | 'test_results' | 'comments'>>;

export type AddTestResultInput = Omit<ITestResult, 'measured_at'>;
export type AddTestCommentInput = Omit<ITestComment, 'created_at' | 'updated_at'>;
