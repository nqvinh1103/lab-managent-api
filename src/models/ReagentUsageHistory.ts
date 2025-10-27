import { ObjectId } from 'mongodb';

export interface IReagentUsageHistory {
  _id?: ObjectId;
  reagent_lot_number: string;
  instrument_id: ObjectId;
  test_order_id?: ObjectId;
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

export type CreateReagentUsageHistoryInput = Omit<IReagentUsageHistory, '_id' | 'created_at'>;
