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
  _id?: ObjectId;          // MongoDB tự sinh
  order_number: string;
  patient_id: ObjectId;
  instrument_id?: ObjectId;
  barcode?: string;
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'failed';
  test_results: any[];
  comments: any[];
  run_by?: ObjectId;       // chỉ set khi order được chạy
  run_at?: Date;           // chỉ set khi order được chạy
  created_at: Date;        // tạo lần đầu
  created_by: ObjectId;    // tạo lần đầu
  updated_at: Date;        // cập nhật mỗi lần update
  updated_by: ObjectId;    // cập nhật mỗi lần update
}

export type TestOrderDocument = ITestOrder & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

export interface CreateTestOrderInput {
  patient_id: ObjectId;
  instrument_id?: ObjectId;
}

export type UpdateTestOrderInput = Partial<Omit<ITestOrder, '_id' | 'created_at' | 'updated_at' | 'test_results' | 'comments'>>;

export type AddTestResultInput = Omit<ITestResult, 'measured_at'>;
export type AddTestCommentInput = Omit<ITestComment, 'created_at' | 'updated_at'>;
