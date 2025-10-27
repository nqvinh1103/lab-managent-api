import { ObjectId } from 'mongodb';

export interface IReagentVendorSupplyHistory {
  _id?: ObjectId;
  reagent_name: string;
  vendor_name: string;
  receipt_date: Date;
  quantity_received: number;
  lot_number: string;
  expiration_date: Date;
  received_by: ObjectId;
  created_at: Date;
}

export type ReagentVendorSupplyHistoryDocument = IReagentVendorSupplyHistory & {
  _id: ObjectId;
  created_at: Date;
};

export type CreateReagentVendorSupplyHistoryInput = Omit<IReagentVendorSupplyHistory, '_id' | 'created_at'>;
