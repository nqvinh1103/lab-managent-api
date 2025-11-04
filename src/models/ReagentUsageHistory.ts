import { ObjectId } from 'mongodb';

export interface IReagentUsageHistory {
  _id?: ObjectId;
  reagent_lot_number: string;
  instrument_id: ObjectId;
  test_order_id?: ObjectId;
  test_order_barcode?: string;
  quantity_used: number;
  used_by: ObjectId;
  used_at: Date;
  created_at: Date;
  created_by: ObjectId;
}

export type ReagentUsageHistoryDocument = IReagentUsageHistory & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateReagentUsageHistoryInput = Omit<IReagentUsageHistory, '_id' | 'created_at' | 'created_by' | 'test_order_id'> & {
  // Frontend friendly: allow instrument_name instead of instrument_id
  instrument_name?: string;
  // Frontend may provide a test order barcode instead of test_order_id
  test_order_barcode?: string;
};
